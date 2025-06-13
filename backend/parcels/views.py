from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Parcel
from .serializers import ParcelSerializer
from students.models import Student


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

        # Create new parcel (remove get_or_create since parcels should be unique)
        parcel = Parcel.objects.create(
            student=student,
            description=data.get("description", ""),
            service=data.get("service", ""),
            status=data.get("status", Parcel.ParcelStatus.PENDING),
            pickup_code=data.get("pickup_code", ""),
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
    # This needs authentication middleware to work properly
    # For now, expecting clerk_id as query parameter
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
def picked_up_parcel(request, parcel_id):
    try:
        parcel = Parcel.objects.get(id=parcel_id)

        # Update status and timestamp
        parcel.status = Parcel.ParcelStatus.PICKED_UP
        parcel.picked_up_time = timezone.now()

        # Handle verification if pickup_code is provided
        pickup_code = request.data.get("pickup_code")
        if pickup_code and parcel.pickup_code == pickup_code:
            parcel.is_verified = True
            parcel.verified_at = timezone.now()

        parcel.save()

        serializer = ParcelSerializer(parcel)
        return Response({
            "parcel": serializer.data,
            "message": "Parcel marked as picked up"
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


@api_view(['PATCH'])
def verify_parcel(request, parcel_id):
    """New view to handle parcel verification"""
    try:
        parcel = Parcel.objects.get(id=parcel_id)
        pickup_code = request.data.get("pickup_code")

        if not pickup_code:
            return Response(
                {"error": "pickup_code is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if parcel.pickup_code == pickup_code:
            parcel.is_verified = True
            parcel.verified_at = timezone.now()
            parcel.save()

            serializer = ParcelSerializer(parcel)
            return Response({
                "parcel": serializer.data,
                "message": "Parcel verified successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid pickup code"},
                status=status.HTTP_400_BAD_REQUEST
            )

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
