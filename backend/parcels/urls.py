from django.urls import path
from .views import (
    create_parcel,
    my_parcels,
    picked_up_parcel,
    all_parcels,
)
urlpatterns = [
    path('create/', create_parcel, name='create_parcel'),
    path('my/', my_parcels, name='my_parcels'),
    path('picked-up/', picked_up_parcel, name='picked_up_parcel'),
    path('all/', all_parcels, name='all_parcels'),
]