from django.urls import path
from .views import create_help_request, get_help_requests , get_my_help_requests, update_help_request, delete_help_request

urlpatterns = [
    path('create/', create_help_request, name='create_help_request'),
    path('my-requests/', get_help_requests, name='get_help_requests'),
    path('my/', get_my_help_requests, name='get_my_help_requests'),
    path('update/<int:pk>/', update_help_request, name='update_help_request'),
    path('delete/<int:pk>/', delete_help_request, name='delete_help_request'),
]