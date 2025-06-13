from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer


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
            # Update existing student
            student.name = data.get("name", student.name)
            student.profile_image = data.get(
                "profile_image", student.profile_image)
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
