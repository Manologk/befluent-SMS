from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceView, StudentDashboardView, StudentViewSet, SessionViewSet, AttendanceLogViewSet,
    PerformanceViewSet, SubscriptionPlanViewSet, ScheduleViewSet, StudentSubscriptionViewSet,TeacherViewSet, GroupViewSet,
    scan_qr_code, recent_attendance, refresh_qr_code
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'attendance', AttendanceLogViewSet)
router.register(r'performance', PerformanceViewSet)
router.register(r'subscription-plans', SubscriptionPlanViewSet)
router.register(r'student-subscriptions', StudentSubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('attendance/scan/<str:student_id>/', AttendanceView.as_view(), name='scan-qr-code'),
    path('attendance/recent/', recent_attendance, name='recent-attendance'),
    path('students/<int:student_id>/refresh-qr/', refresh_qr_code, name='refresh-qr-code'),
]
