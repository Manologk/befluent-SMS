from rest_framework import serializers
from .models import *


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'


class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = '__all__'


class PerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performance
        fields = '__all__'


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class StudentSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSubscription
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    current_capacity = serializers.SerializerMethodField()


    class Meta:
        model = Group
        fields = '__all__'

    def get_current_capacity(self, obj):
        return obj.students.count()


class ScheduleSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    group = GroupSerializer(read_only=True)
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'


class GroupStudentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = GroupStudent
        fields = '__all__'


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name', 'teacher', 'max_capacity', 'status']

    def validate(self, data):
        if data.get('max_capacity', 0) <= 0:
            raise serializers.ValidationError("Maximum capacity must be greater than 0")
        return data
