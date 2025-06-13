from django.db import models

# Create your models here.


class Student(models.Model):
    clerk_id      = models.CharField(max_length=100, unique=True)
    name          = models.CharField(max_length=255)
    email         = models.EmailField(unique=True)
    profile_image = models.URLField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    phone_number  = models.CharField(max_length=15, null=True, blank=True)
    room_number   = models.CharField(max_length=5, null=True, blank=True)
    block         = models.CharField(max_length=10, null=True, blank=True)
    def __str__(self):
        return f"{self.name} ({self.clerk_id})"
