from rest_framework import serializers
from .models import *
from django.utils import timezone
from datetime import datetime
from django.contrib.auth import get_user_model
from django.db import transaction
import qrcode
from io import BytesIO
import base64


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    className = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    isOnline = serializers.SerializerMethodField()
    proficiencyLevel = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'time', 'className', 'students', 'type', 'isOnline', 'proficiencyLevel', 
                 'date', 'start_time', 'end_time', 'status', 'teacher', 'student', 'group']

    def get_time(self, obj):
        return obj.start_time.strftime('%I:%M %p')

    def get_className(self, obj):
        if obj.type == 'PRIVATE' and obj.student:
            return f"Private Lesson - {obj.student.name}"
        elif obj.group:
            return f"Group Lesson - {obj.group.name}"
        return "Unassigned Lesson"

    def get_students(self, obj):
        if obj.type == 'PRIVATE' and obj.student:
            return [obj.student.name]
        elif obj.type == 'GROUP' and obj.group:
            return [gs.student.name for gs in obj.group.students.all()]
        return []

    def get_type(self, obj):
        return 'Private' if obj.type == 'PRIVATE' else 'Group'

    def get_proficiencyLevel(self, obj):
        if obj.type == 'PRIVATE' and obj.student:
            return obj.student.level
        elif obj.type == 'GROUP' and obj.group and obj.group.students.exists():
            # Get level from the first student in the group
            first_student = obj.group.students.first().student
            return first_student.level if first_student else None
        return None

    def get_isOnline(self, obj):
        return getattr(obj, 'is_online', False)

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data['time'] = instance.start_time.strftime('%I:%M %p')
    #     data['className'] = f"{'Private' if instance.type == 'PRIVATE' else 'Group'} Lesson"
    #     data['students'] = [instance.student.name] if instance.student else []
    #     if instance.group:
    #         data['students'] = [gs.student.name for gs in instance.group.students.all()]
    #     return data

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
    days = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6),
        help_text='List of weekday numbers (0-6, Monday is 0)'
    )
    
    class Meta:
        model = Schedule
        fields = '__all__'

    def validate_days(self, value):
        if not value:
            raise serializers.ValidationError("At least one day must be selected")
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Days must be unique")
        return value


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


class CreateStudentWithUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=20)
    subscription_plan = serializers.CharField(max_length=255)
    level = serializers.CharField(max_length=50)

    def create(self, validated_data):
        User = get_user_model()
        subscription_plan = SubscriptionPlan.objects.get(
            name__iexact=validated_data['subscription_plan']
        )

        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                role='student'
            )

            # Create student
            student = Student.objects.create(
                user=user,
                name=validated_data['name'],
                email=validated_data['email'],
                phone_number=validated_data['phone_number'],
                level=validated_data['level'],
                qr_code=str(user.id),  # Simply use the user ID as QR code
                subscription_balance=subscription_plan.price,
                lessons_remaining=subscription_plan.number_of_lessons
            )

            # Create student subscription
            StudentSubscription.objects.create(
                student=student,
                subscription_plan=subscription_plan,
                start_date=timezone.now().date()
            )

            return student
