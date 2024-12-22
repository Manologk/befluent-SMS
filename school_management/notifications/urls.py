from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
