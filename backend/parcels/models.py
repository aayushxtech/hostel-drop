from django.db import models
from students.models import Student
import uuid


class Parcel(models.Model):
    class ParcelStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PICKED_UP = 'PICKED_UP', 'Picked Up'

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='parcels')
    tracking_id = models.CharField(
        max_length=36, unique=True, default=uuid.uuid4, editable=False)  # ✅ Auto-generated UUID
    description = models.TextField(blank=True, null=True)
    service = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=ParcelStatus.choices,
        default=ParcelStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    picked_up_time = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # ✅ Ensure tracking_id is always generated
        if not self.tracking_id:
            self.tracking_id = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Parcel {self.tracking_id} for {self.student.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_id']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
