from django.urls import path
from .views import sync_clerk_user, get_student_id

urlpatterns = [
    path('sync-clerk/', sync_clerk_user, name='sync_clerk_user'),
    path('get-id/', get_student_id, name='get_student_id'),  # ✅ Add this line
]

