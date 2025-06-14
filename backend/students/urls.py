from django.urls import path
from .views import sync_clerk_user, get_student_id, get_my_details, update_my_details, get_my_parcels

urlpatterns = [
    path('sync-clerk/', sync_clerk_user, name='sync_clerk_user'),
    path('get-id/', get_student_id, name='get_student_id'),
    path('<uuid:student_id>/me/', get_my_details, name='get_my_details'),
    path('<uuid:student_id>/me/update', update_my_details, name='update_my_details'),
    path('<uuid:student_id>/me/parcels/', get_my_parcels, name='get_my_parcels'),
    ]


