<<<<<<< HEAD
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Temporary in-memory parcel list
PARCELS = []

@csrf_exempt
def create_parcel(request):
    if request.method == "POST":
        data = json.loads(request.body)
        PARCELS.append(data)
        return JsonResponse({"message": "Parcel created successfully!"}, status=201)
    return JsonResponse({"error": "Invalid request"}, status=400)

def all_parcels(request):
    return JsonResponse(PARCELS, safe=False)
=======
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
    """Simple check - just mark parcel as picked up"""
    try:
        parcel = Parcel.objects.get(id=parcel_id)

        # Update status and timestamp
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
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d
