from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from parcels.models import Parcel
from parcels.serializers import ParcelSerializer
from students.models import Student
from students.serializers import StudentSerializer


# ---------- PARCEL VIEWS ----------

@api_view(['POST'])
def create_parcel(request):
    data = request.data
    student_id = data.get("student_id")

    if not student_id:
        return Response(
            {"error": "student_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Verify student exists
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create new parcel
        parcel = Parcel.objects.create(
            student=student,
            description=data.get("description", ""),
            service=data.get("service", ""),
            status=data.get("status", Parcel.ParcelStatus.PENDING),
        )

        serializer = ParcelSerializer(parcel)
        return Response({
            "parcel": serializer.data,
            "created": True,
            "message": "Parcel created successfully"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def my_parcels(request):
    clerk_id = request.GET.get('clerk_id')

    if not clerk_id:
        return Response(
            {"error": "clerk_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        parcels = Parcel.objects.filter(student__clerk_id=clerk_id)
        serializer = ParcelSerializer(parcels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
def mark_picked_up(request, parcel_id):
    """Mark parcel as picked up"""
    try:
        parcel = Parcel.objects.get(id=parcel_id)

        parcel.status = Parcel.ParcelStatus.PICKED_UP
        parcel.picked_up_time = timezone.now()
        parcel.save()

        serializer = ParcelSerializer(parcel)
        return Response({
            "parcel": serializer.data,
            "message": "Parcel marked as picked up successfully"
        }, status=status.HTTP_200_OK)

    except Parcel.DoesNotExist:
        return Response(
            {"error": "Parcel not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def all_parcels(request):
    try:
        parcels = Parcel.objects.all()
        serializer = ParcelSerializer(parcels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ---------- STUDENT VIEWS ----------

@api_view(['POST'])
def sync_clerk_user(request):
    data = request.data
    clerk_id = data.get("clerk_id")

    if not clerk_id:
        return Response(
            {"error": "clerk_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student, created = Student.objects.get_or_create(
            clerk_id=clerk_id,
            defaults={
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "profile_image": data.get("profile_image", ""),
            }
        )

        if not created:
            student.name = data.get("name", student.name)
            student.profile_image = data.get("profile_image", student.profile_image)
            student.save()

        serializer = StudentSerializer(student)
        return Response({
            "student": serializer.data,
            "created": created,
            "message": "Student created" if created else "Student updated"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_student_id(request):
    clerk_id = request.GET.get("clerk_id")

    if not clerk_id:
        return Response(
            {"error": "clerk_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student = Student.objects.get(clerk_id=clerk_id)
        return Response({"student_id": student.id}, status=status.HTTP_200_OK)

    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )
@api_view(['GET'])
def get_my_details(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
def update_my_details(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = StudentSerializer(student, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(['GET'])
def get_my_parcels(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    parcels = Parcel.objects.filter(student=student).order_by('-created_at')
    serializer = ParcelSerializer(parcels, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
