from django.urls import path
<<<<<<< HEAD
from . import views

urlpatterns = [
    path("create", views.create_parcel),
    path("all", views.all_parcels),
=======
from .views import (
    create_parcel,
    my_parcels,
    mark_picked_up,
    all_parcels,
)

urlpatterns = [
    path('create/', create_parcel, name='create_parcel'),
    path('my/', my_parcels, name='my_parcels'),
    path('<int:parcel_id>/picked-up/', mark_picked_up, name='mark_picked_up'),
    path('all/', all_parcels, name='all_parcels'),
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d
]
