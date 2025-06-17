from django.urls import path
from .views import create_help_request, get_help_requests
urlpatterns = [
    path('create/', create_help_request, name='create_help_request'),
    path('my-requests/', get_help_requests, name='get_help_requests'),
]