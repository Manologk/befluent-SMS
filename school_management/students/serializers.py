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


class GroupSerializer(serializers.ModelSerializer):
    current_capacity = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'language', 'level', 'max_capacity', 
                 'status', 'current_capacity', 'created_at', 'updated_at', 'students']

    def get_current_capacity(self, obj):
        return obj.students.count()

    def get_students(self, obj):
        return [{
            'id': student.student.id,
            'name': student.student.name,
            'email': student.student.email,
            'level': student.student.level
        } for student in obj.students.all()]


class TeacherSerializer(serializers.ModelSerializer):
    teaching_groups = GroupSerializer(many=True, read_only=True)
    private_students = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'name', 'email', 'phone_number', 'specializations', 'teaching_groups', 'private_students']

    def get_private_students(self, obj):
        # Get students from private sessions
        private_students = Student.objects.filter(
            session__teacher=obj,
            session__type='PRIVATE'
        ).distinct()
        return StudentSerializer(private_students, many=True).data


class SessionSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    className = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    isOnline = serializers.SerializerMethodField()
    proficiencyLevel = serializers.SerializerMethodField()
    student_details = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'time', 'className', 'students', 'type', 'isOnline', 'proficiencyLevel', 
                 'date', 'start_time', 'end_time', 'status', 'teacher', 'student', 'group',
                 'student_details']

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

    def get_isOnline(self, obj):
        return getattr(obj, 'is_online', False)

    def get_proficiencyLevel(self, obj):
        if obj.type == 'PRIVATE' and obj.student:
            return obj.student.level
        elif obj.type == 'GROUP' and obj.group and obj.group.students.exists():
            # Get level from the first student in the group
            first_student = obj.group.students.first().student
            return first_student.level if first_student else None
        return None

    def get_student_details(self, obj):
        if obj.type == 'PRIVATE' and obj.student:
            return {
                'id': obj.student.id,
                'name': obj.student.name,
                'level': obj.student.level,
                'email': obj.student.email,
                'phone_number': obj.student.phone_number
            }
        elif obj.type == 'GROUP' and obj.group:
            return [{
                'id': student.student.id,
                'name': student.student.name,
                'level': student.student.level,
                'email': student.student.email,
                'phone_number': student.student.phone_number
            } for student in obj.group.students.all()]
        return None


class AttendanceLogSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source='student.name')
    studentId = serializers.CharField(source='student.id')
    grade = serializers.CharField(source='student.level')
    language = serializers.SerializerMethodField()
    date = serializers.DateField(source='session.date')

    class Meta:
        model = AttendanceLog
        fields = ['id', 'studentName', 'studentId', 'grade', 'language', 'date', 'status']

    def get_language(self, obj):
        if obj.session.group:
            return obj.session.group.language
        return None


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


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name', 'description', 'language', 'level', 'max_capacity']
        extra_kwargs = {
            'name': {'required': True},
            'language': {'required': True},
            'level': {'required': True},
            'max_capacity': {'required': True},
            'description': {'required': False}
        }

    def validate(self, data):
        if data.get('max_capacity', 0) <= 0:
            raise serializers.ValidationError("Maximum capacity must be greater than 0")
        return data


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
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate days are not allowed")
        return value


class GroupStudentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = GroupStudent
        fields = '__all__'


class CreateStudentWithUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=20)
    subscription_plan = serializers.CharField(max_length=255)
    level = serializers.CharField(max_length=50)

    @transaction.atomic
    def create(self, validated_data):
        User = get_user_model()
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='student'
        )

        # Create student
        student = Student.objects.create(
            user=user,
            name=validated_data['name'],
            email=validated_data['email'],
            phone_number=validated_data.get('phone_number', ''),
            level=validated_data.get('level', '')
        )

        return student


class CreateTeacherWithUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=20)
    specializations = serializers.ListField(child=serializers.CharField())

    @transaction.atomic
    def create(self, validated_data):
        User = get_user_model()
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='instructor'
        )

        # Create teacher
        teacher = Teacher.objects.create(
            user=user,
            name=validated_data['name'],
            email=validated_data['email'],
            phone_number=validated_data.get('phone_number', ''),
            specializations=validated_data.get('specializations', [])
        )

        return teacher
