from django.db import models
from students.models import Student
from django.utils import timezone

class HelpRequest(models.Model):
    USER_TYPES = [
        ('student', 'Student'),
        ('warden', 'Warden'),
        ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    response = models.TextField(null=True, blank=True)
     
    def __str__(self):
        return f"HelpRequest({self.user_type}, {self.student}, {self.status})"
