from django.contrib import admin
from .models import Student, Session, AttendanceLog, Performance, SubscriptionPlan, StudentSubscription


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subscription_balance', 'lessons_remaining')
    search_fields = ('name', 'email')
    list_filter = ('studentsubscription__subscription_plan'),
    ordering = ('name',)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('date', 'language', 'level', 'topic')
    list_filter = ('language', 'level', 'date')
    search_fields = ('topic',)
    date_hierarchy = 'date'


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'scanned_at', 'valid')
    list_filter = ('valid', 'session__language', 'session__level', 'scanned_at')
    search_fields = ('student__name', 'session__topic')
    date_hierarchy = 'scanned_at'


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'date', 'vocabulary_score', 'grammar_score',
                    'speaking_score', 'listening_score')
    list_filter = ('date', 'session__language', 'session__level')
    search_fields = ('student__name', 'comments')
    date_hierarchy = 'date'


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


from django.contrib import admin
from .models import Student, Teacher, Group, Schedule, GroupStudent




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
    list_display = ('teacher', 'group', 'student', 'day', 'start_time', 'end_time')
    list_filter = ('day', 'is_recurring')
    search_fields = ('teacher__name', 'group__name', 'student__name')


@admin.register(GroupStudent)
class GroupStudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'group', 'joined_date')
    list_filter = ('joined_date',)
    search_fields = ('student__name', 'group__name')
