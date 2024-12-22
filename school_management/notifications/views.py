from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.all()
        recipient_email = self.request.query_params.get('recipient_email', None)
        notification_type = self.request.query_params.get('type', None)

        if recipient_email is not None:
            queryset = queryset.filter(recipient_email=recipient_email)
        if notification_type is not None:
            queryset = queryset.filter(type=notification_type)

        return queryset.order_by('-sent_at')
