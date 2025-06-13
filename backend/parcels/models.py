from django.db import models
from students.models import Student
from django.utils import timezone


class Parcel(models.Model):
    class ParcelStatus(models.TextChoices):
        PENDING = "Pending"
        DELIVERED = "Delivered"
        PICKED_UP = "Picked Up"

    id = models.AutoField(primary_key=True)

    student = models.ForeignKey(
        Student,
        to_field='id',
        on_delete=models.CASCADE,
        related_name='parcels'
    )

    description = models.TextField()  # e.g. "Amazon box", "Food package"
    service = models.CharField(max_length=100)  # e.g. BlueDart, DTDC

    status = models.CharField(
        max_length=20,
        choices=ParcelStatus.choices,
        default=ParcelStatus.PENDING
    )

    pickup_code = models.CharField(max_length=6, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    received_time = models.DateTimeField(auto_now_add=True)
    picked_up_time = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parcel #{self.id} — {self.status} — {self.student.name}"

    class Meta:
        ordering = ['-received_time']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['received_time']),
            models.Index(fields=['student']),
        ]
