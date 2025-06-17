from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Parcel
from .serializers import ParcelSerializer
from students.models import Student
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
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

        # ✅ Handle image upload to Cloudinary manually for better control
        image_url = None
        if 'image' in request.FILES:
            try:
                image_file = request.FILES['image']
                
                # Upload to Cloudinary with specific settings
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="hosteldrop/parcels",
                    public_id=f"parcel_{student.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}",
                    overwrite=True,
                    resource_type="image",
                    transformation=[
                        {'width': 800, 'height': 600, 'crop': 'limit'},
                        {'quality': 'auto:good'}
                    ]
                )
                
                image_url = upload_result['secure_url']
                print(f"✅ Image uploaded to Cloudinary: {image_url}")
                
            except Exception as upload_error:
                print(f"❌ Image upload failed: {upload_error}")
                # Continue without image if upload fails

        # Create new parcel
        parcel = Parcel.objects.create(
            student=student,
            description=data.get("description", ""),
            service=data.get("service", ""),
            status=data.get("status", Parcel.ParcelStatus.PENDING),
        )
        
        # ✅ Set the image URL if upload was successful
        if image_url:
            parcel.image = image_url
            parcel.save()

        serializer = ParcelSerializer(parcel)
        response_data = serializer.data
        
        # ✅ Ensure image URL is included in response
        if image_url:
            response_data['image'] = image_url
            
        return Response({
            "parcel": response_data,
            "created": True,
            "message": f"Parcel created successfully with tracking ID: {parcel.tracking_id}"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"❌ Error creating parcel: {e}")
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
            "message": f"Parcel {parcel.tracking_id} marked as picked up successfully"
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


class ParcelViewSet(viewsets.ModelViewSet):
    queryset = Parcel.objects.all()
    serializer_class = ParcelSerializer
    parser_classes = (MultiPartParser, FormParser)
