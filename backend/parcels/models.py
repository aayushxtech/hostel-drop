from django.db import models
from students.models import Student
import uuid
from cloudinary.models import CloudinaryField


class Parcel(models.Model):
    class ParcelStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PICKED_UP = 'PICKED_UP', 'Picked Up'

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='parcels')
    tracking_id = models.CharField(
        max_length=36, unique=True, default=uuid.uuid4, editable=False)
    description = models.TextField(blank=True, null=True)
    service = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=ParcelStatus.choices,
        default=ParcelStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    picked_up_time = models.DateTimeField(blank=True, null=True)
    
    image = CloudinaryField(
        'image',
        folder='hosteldrop/parcels',
        blank=True,
        null=True,
        transformation={
            'width': 800,
            'height': 600,
            'crop': 'limit',
            'quality': 'auto:good'
        }
    )

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Parcel {self.tracking_id} -> {self.student.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_id']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
