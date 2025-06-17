from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import HelpRequest
from .serializers import HelpRequestSerializer

@api_view(['POST'])
def create_help_request(request):
   
    serializer = HelpRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_help_requests(request):
    user_type = request.query_params.get('user_type', None)
    if user_type == 'student':
        help_requests = HelpRequest.objects.filter(user_type='student')
    elif user_type == 'warden':
        help_requests = HelpRequest.objects.filter(user_type='warden')
    else:
        return Response({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = HelpRequestSerializer(help_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
@api_view(['GET'])
def get_my_help_requests(request):
    email = request.query_params.get('email', None)

    if not email:
        return Response({"error": "Email parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    help_requests = HelpRequest.objects.filter(student=student)
    serializer = HelpRequestSerializer(help_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
