from django.db import models

# Create your models here.


class Student(models.Model):
    clerk_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile_image = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
