from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.http import HttpResponse
from django.views.decorators.http import etag
from django.views.decorators.cache import cache_control
from django.shortcuts import get_object_or_404
from django.core.signing import BadSignature, SignatureExpired
from .models import Parcel
from .serializers import ParcelSerializer
from students.models import Student
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
import base64
from utils.qr import make_qr_png, unsign_token


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
            "message": f"Parcel created successfully with tracking ID: {parcel.tracking_id}",
            "qr_url": f"/parcels/qr/{parcel.id}/",  # ✅ Fixed to use parcel.id
            # ✅ Added base64 URL
            "qr_base64_url": f"/parcels/qr/{parcel.id}/base64/"
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

        # ✅ Add QR URLs to each parcel
        response_data = serializer.data
        for parcel_data in response_data:
            parcel_data['qr_url'] = f"/parcels/qr/{parcel_data['id']}/"
            parcel_data['qr_base64_url'] = f"/parcels/qr/{parcel_data['id']}/base64/"

        return Response(response_data, status=status.HTTP_200_OK)
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

        # ✅ Add QR URLs to each parcel
        response_data = serializer.data
        for parcel_data in response_data:
            parcel_data['qr_url'] = f"/parcels/qr/{parcel_data['id']}/"
            parcel_data['qr_base64_url'] = f"/parcels/qr/{parcel_data['id']}/base64/"

        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ✅ QR Code generation endpoint - generates QR on-the-go
@etag(lambda r, parcel_id: f"parcelqr-{parcel_id}")
@cache_control(max_age=86400)  # Cache for 24 hours
def parcel_qr(request, parcel_id):
    """Generate QR code PNG for parcel pickup - generated on-the-go"""
    parcel = get_object_or_404(Parcel, id=parcel_id)

    # Only generate QR for pending parcels
    if parcel.status != Parcel.ParcelStatus.PENDING:
        return HttpResponse("Parcel not available for pickup", status=410)

    # Generate QR PNG using your existing utility
    png_bytes = make_qr_png(str(parcel_id), max_age_hours=48)

    return HttpResponse(
        png_bytes,
        content_type="image/png",
        headers={
            'Content-Disposition': f'inline; filename="parcel_{parcel.tracking_id}_qr.png"'
        }
    )


# ✅ QR Code verification endpoint
@api_view(["POST"])
def verify_qr(request):
    """Verify scanned QR token and mark parcel as picked up"""
    token = request.data.get("token")
    if not token:
        return Response(
            {"error": "token required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Verify token signature and extract parcel_id
        parcel_id = unsign_token(token, max_age_hours=48)
        # ✅ Convert to int since unsign_token returns string
        parcel_id = int(parcel_id)
    except (SignatureExpired, ValueError) as e:
        if isinstance(e, SignatureExpired):
            return Response(
                {"valid": False, "reason": "expired",
                    "message": "QR code has expired"},
                status=status.HTTP_410_GONE
            )
        else:
            return Response(
                {"valid": False, "reason": "invalid",
                    "message": "Invalid parcel ID in QR code"},
                status=status.HTTP_400_BAD_REQUEST
            )
    except BadSignature:
        return Response(
            {"valid": False, "reason": "tampered", "message": "Invalid QR code"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get the parcel
    parcel = get_object_or_404(Parcel, id=parcel_id)

    # Check if parcel is still available for pickup
    if parcel.status != Parcel.ParcelStatus.PENDING:
        return Response(
            {
                "valid": False,
                "reason": "already_picked",
                "message": "Parcel has already been picked up"
            },
            status=status.HTTP_409_CONFLICT
        )

    # Mark as picked up
    parcel.status = Parcel.ParcelStatus.PICKED_UP
    parcel.picked_up_time = timezone.now()
    parcel.save(update_fields=["status", "picked_up_time"])

    return Response({
        "valid": True,
        "message": "Parcel successfully picked up!",
        "parcel": {
            "id": parcel.id,
            "tracking_id": parcel.tracking_id,
            "student_name": parcel.student.name,
            "student_room": parcel.student.room_number,
            "student_block": parcel.student.hostel_block,
            "picked_up_at": parcel.picked_up_time.isoformat(),
            "description": parcel.description,
            "service": parcel.service
        }
    })


# ✅ Get QR code as base64 (for mobile/web display)
@api_view(['GET'])
def parcel_qr_base64(request, parcel_id):
    """Get QR code as base64 encoded string for easy display in web/mobile"""
    parcel = get_object_or_404(Parcel, id=parcel_id)

    # Only generate QR for pending parcels
    if parcel.status != Parcel.ParcelStatus.PENDING:
        return Response(
            {"error": "Parcel not available for pickup"},
            status=status.HTTP_410_GONE
        )

    # Generate QR PNG
    png_bytes = make_qr_png(str(parcel_id), max_age_hours=48)

    # Convert to base64
    qr_base64 = base64.b64encode(png_bytes).decode('utf-8')

    return Response({
        "parcel_id": parcel_id,
        "tracking_id": parcel.tracking_id,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "expires_in_hours": 48,
        "student_info": {
            "name": parcel.student.name,
            "room": parcel.student.room_number,
            "block": parcel.student.hostel_block
        }
    })


class ParcelViewSet(viewsets.ModelViewSet):
    queryset = Parcel.objects.all()
    serializer_class = ParcelSerializer
    parser_classes = (MultiPartParser, FormParser)
