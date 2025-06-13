from django.db import models
from students.models import Student  # student model from students

class Parcel(models.Model):
    id               = models.AutoField(primary_key=True)
    student          = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='parcels')
    description      = models.TextField()
    service          = models.CharField(max_length=100)  # e.g., Standard, Express
    status           = models.CharField(max_length=50, default='Pending')  # e.g., Pending, In Transit, Delivered
    received_time    = models.DateTimeField(null=True, blank=True)
    picked_up_time   = models.DateTimeField(null=True, blank=True)


    def __str__(self):
        return f"Parcel {self.id} - {self.status}"
