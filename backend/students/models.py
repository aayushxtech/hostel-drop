from django.db import models
import uuid
from django.core.validators import RegexValidator

# Create your models here.

phone_validator = RegexValidator(
    regex=r'^\d{10}$',
    message="Phone number must be 10 digits."
)


class Student(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    clerk_id = models.CharField(
        max_length=128, unique=True)  # Auth provider ref
    name = models.CharField(
        max_length=255, blank=False)  # e.g. "John Doe"
    email = models.EmailField(unique=True)
    profile_image = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, validators=[
                             phone_validator])  # e.g. "9876543210"
    hostel_block = models.CharField(
        max_length=30, blank=True)    # e.g. "Block C"
    room_number = models.CharField(max_length=10, blank=True)    # e.g. "204‑B"
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.clerk_id})"

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["clerk_id"]),
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["hostel_block"]),
            models.Index(fields=["room_number"]),
        ]
