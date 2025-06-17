from rest_framework import serializers
from .models import HelpRequest

class HelpRequestSerializer(serializers.ModelSerializer):
    trackingId = serializers.SerializerMethodField()
    issueType = serializers.SerializerMethodField()

    class Meta:
        model = HelpRequest
        fields = [
            'id',
            'parcel',
            'trackingId',
            'issueType',
            'message',
            'status',
            'created_at',
        ]

    def get_trackingId(self, obj):
        return obj.parcel.tracking_id if obj.parcel else None

    def get_issueType(self, obj):
        return obj.message

