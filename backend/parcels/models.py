from django.db import models
<<<<<<< HEAD

# Create your models here.
=======
from students.models import Student


class Parcel(models.Model):
    class ParcelStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PICKED_UP = 'PICKED_UP', 'Picked Up'

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='parcels')
    description = models.TextField(blank=True, null=True)
    service = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=ParcelStatus.choices,
        default=ParcelStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    picked_up_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Parcel for {self.student.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d
