from django.db import models


# Create your models here.
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('low-fund', 'Low Fund'),
        ('low-sessions', 'Low Sessions'),
        ('performance-alert', 'Performance Alert'),
    ]

    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    recipient_email = models.EmailField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.recipient_email}"
