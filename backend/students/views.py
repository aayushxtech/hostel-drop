from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from parcels.models import Parcel
from parcels.serializers import ParcelSerializer
from students.models import Student
from students.serializers import StudentSerializer


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
                "phone": data.get("phone", ""),
                "hostel_block": data.get("hostel_block", ""),
                "room_number": data.get("room_number", ""),
            }
        )

        if not created:
            # Update existing student with new data
            student.name = data.get("name", student.name)
            student.email = data.get("email", student.email)
            student.profile_image = data.get(
                "profile_image", student.profile_image)
            student.phone = data.get("phone", student.phone)
            student.hostel_block = data.get(
                "hostel_block", student.hostel_block)
            student.room_number = data.get("room_number", student.room_number)
            student.save()

        serializer = StudentSerializer(student)
        return Response({
            "student": serializer.data,
            "created": created,
            "message": "Student created successfully" if created else "Student updated successfully"
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except ValidationError as e:
        return Response(
            {"error": "Validation error", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_student_details(request, student_id):
    """Get student details by student ID"""
    try:
        student = Student.objects.get(id=student_id)
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_student_by_clerk_id(request):
    """Get student details by clerk ID"""
    clerk_id = request.GET.get('clerk_id')

    if not clerk_id:
        return Response(
            {"error": "clerk_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student = Student.objects.get(clerk_id=clerk_id)
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
def update_student_details(request, student_id):
    """Update student details by student ID"""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        serializer = StudentSerializer(
            student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "student": serializer.data,
                "message": "Student updated successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Validation error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    except ValidationError as e:
        return Response(
            {"error": "Validation error", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_my_parcels(request, student_id):
    """Get all parcels for a specific student by student ID"""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        parcels = Parcel.objects.filter(
            student=student).order_by('-created_at')
        serializer = ParcelSerializer(parcels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_all_students(request):
    """Get all students (for admin use)"""
    try:
        students = Student.objects.filter(is_active=True).order_by('name')
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
