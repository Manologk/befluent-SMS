from django.contrib import admin
from .models import (
    Student, Teacher, Group, Schedule, Session,
    AttendanceLog, Performance, SubscriptionPlan,
    StudentSubscription, GroupStudent
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'level')
    search_fields = ('name', 'email')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'type', 'status', 'teacher')
    list_filter = ('type', 'status')
    search_fields = ('teacher__name', 'student__name', 'group__name')
    date_hierarchy = 'date'


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'scanned_at', 'valid')
    list_filter = ('valid', 'session__type', 'session__status')
    search_fields = ('student__name', 'session__id')


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'date')
    list_filter = ('date', 'session__type')
    search_fields = ('student__name',)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'number_of_lessons', 'price')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(StudentSubscription)
class StudentSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('student', 'subscription_plan', 'start_date', 'end_date')
    list_filter = ('subscription_plan', 'start_date', 'end_date')
    search_fields = ('student__name',)
    date_hierarchy = 'start_date'


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'email')
    search_fields = ('name', 'email')


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher', 'max_capacity', 'status')
    list_filter = ('status',)
    search_fields = ('name',)


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'teacher', 'type', 'get_days', 'start_time', 'end_time')
    list_filter = ('teacher', 'is_recurring')
    search_fields = ('teacher__name', 'student__name', 'group__name')

    def get_days(self, obj):
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return ', '.join(day_names[day] for day in obj.days)
    get_days.short_description = 'Days'

    def type(self, obj):
        return 'Group' if obj.group else 'Private'


@admin.register(GroupStudent)
class GroupStudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'group', 'joined_date')
    list_filter = ('joined_date',)
    search_fields = ('student__name', 'group__name')
