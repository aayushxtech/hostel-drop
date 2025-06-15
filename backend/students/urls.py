from django.urls import path
from .views import (
    sync_clerk_user,
    get_student_details,
    get_student_by_clerk_id,
    update_student_details,
    get_my_parcels,
    get_all_students,
)

urlpatterns = [
    # Clerk integration
    path('sync-clerk/', sync_clerk_user, name='sync_clerk_user'),

    # Student operations by clerk_id (for frontend)
    path('by-clerk/', get_student_by_clerk_id, name='get_student_by_clerk_id'),

    # Student operations by student_id (for internal API)
    path('<uuid:student_id>/', get_student_details, name='get_student_details'),
    path('<uuid:student_id>/update/', update_student_details,
         name='update_student_details'),
    path('<uuid:student_id>/parcels/', get_my_parcels, name='get_my_parcels'),

    # Admin operations
    path('all/', get_all_students, name='get_all_students'),
]
