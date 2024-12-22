from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ParentViewSet, ParentStudentLinkViewSet

router = DefaultRouter()
router.register(r'parents', ParentViewSet)
router.register(r'parent-student-links', ParentStudentLinkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
