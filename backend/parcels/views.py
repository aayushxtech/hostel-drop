from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Parcel
from .serializers import ParcelSerializer

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
        parcel, created = Parcel.objects.get_or_create(
            student_id=student_id,
            defaults={
                "description": data.get("description", ""),
                "status": data.get("status", "pending"),
                "location": data.get("location", ""),
            }
        )
        
        if not created:
            # Update existing parcel
            parcel.description = data.get("description", parcel.description)
            parcel.status = data.get("status", parcel.status)
            parcel.location = data.get("location", parcel.location)
            parcel.save()
        
        serializer = ParcelSerializer(parcel)
        return Response({
            "parcel": serializer.data,
            "created": created,
            "message": "Parcel created" if created else "Parcel updated"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])

def my_parcels(request):
    clerk_id = request.user.id
    parcels = Parcel.objects.filter(student__clerk_id=clerk_id)
    serializer = ParcelSerializer(parcels, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])

def picked_up_parcel(request, parcel_id):
    try:
        parcel = Parcel.objects.get(id=parcel_id)
        parcel.picked_up_time = request.data.get("picked_up_time", None)
        parcel.status = "Picked Up"
        parcel.save()
        
        serializer = ParcelSerializer(parcel)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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
    parcels = Parcel.objects.all()
    serializer = ParcelSerializer(parcels, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)