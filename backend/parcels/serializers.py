from rest_framework import serializers
from .models import Parcel
from students.serializers import StudentMiniSerializer


class ParcelSerializer(serializers.ModelSerializer):
    student = StudentMiniSerializer(read_only=True)
    tracking_id = serializers.CharField(read_only=True)
    image = serializers.CharField(read_only=True)  # ✅ Change to CharField for Cloudinary URLs

    class Meta:
        model = Parcel
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Ensure student name is always present
        if data['student'] and 'name' in data['student']:
            pass
        else:
            data['student'] = {
                'id': instance.student.id,
                'name': instance.student.name,
                'room_number': instance.student.room_number,
                'phone': instance.student.phone,
                'email': instance.student.email
            }

        if not data.get('tracking_id'):
            data['tracking_id'] = str(instance.tracking_id)

        # ✅ Handle Cloudinary image URL properly
        if instance.image:
            # CloudinaryField returns the full URL directly
            data['image'] = str(instance.image.url) if hasattr(instance.image, 'url') else str(instance.image)
        else:
            data['image'] = None

        return data
