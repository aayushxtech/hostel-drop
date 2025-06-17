from django.urls import path, include
from .views import (
    create_parcel,
    my_parcels,
    mark_picked_up,
    all_parcels,
    ParcelViewSet
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'viewset', ParcelViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('create/', create_parcel, name='create_parcel'),
    path('my/', my_parcels, name='my_parcels'),
    path('<int:parcel_id>/picked-up/', mark_picked_up, name='mark_picked_up'),
    path('all/', all_parcels, name='all_parcels'),
]
