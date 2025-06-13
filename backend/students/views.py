from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer


@api_view(['POST'])
def sync_clerk_user(request):
    data = request.data
    clerk_id = data.get("clerk_id")

    student, created = Student.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            "name": data.get("name"),
            "email": data.get("email"),
            "profile_image": data.get("profile_image"),
        }
    )

    if not created:
        student.name = data.get("name", student.name)
        student.profile_image = data.get(
            "profile_image", student.profile_image)
        student.save()

    serializer = StudentSerializer(student)
    return Response(serializer.data)
