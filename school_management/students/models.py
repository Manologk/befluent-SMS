from django.db import models
from django.conf import settings
import uuid
import json
from django.utils import timezone
import base64
import qrcode
from io import BytesIO
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta


# Create your models here.
class Student(models.Model):
    STUDENT_TYPE_CHOICES = [
        ('GROUP', 'Group Student'),
        ('PRIVATE', 'Private Student'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    subscription_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lessons_remaining = models.IntegerField(default=0)
    qr_code = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    student_type = models.CharField(max_length=10, choices=STUDENT_TYPE_CHOICES)
    level = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    def generate_qr_code(self):
        try:
            # Create minimal QR code data
            qr_data = f"{self.id}"
            
            # Generate QR code with optimized parameters
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=8,    # Smaller box size
                border=1,      # Minimal border
            )
            qr.add_data(qr_data)
            qr.make(fit=True)

            # Create image with minimal size
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64 with optimization
            buffer = BytesIO()
            img.save(buffer, format='PNG', optimize=True)
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Save with data URI format
            self.qr_code = qr_data
            self.save()
            
            return self.qr_code
            
        except Exception as e:
            print(f"Error generating QR code: {e}")
            raise


class Session(models.Model):
    date = models.DateField()
    language = models.CharField(max_length=255)  # e.g., "English", "Spanish"
    level = models.CharField(max_length=50)  # e.g., "Beginner", "Intermediate"
    topic = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.language} ({self.level}) - {self.date}"


class AttendanceLog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)
    valid = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.name} - {self.session.date}"


class Performance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    date = models.DateField()
    vocabulary_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grammar_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    speaking_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    listening_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.name} - {self.session.date}"


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Basic Plan"
    number_of_lessons = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class StudentSubscription(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.name} - {self.subscription_plan.name}"


class Teacher(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    specializations = models.JSONField(default=list)


class Group(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    max_capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def is_full(self):
        return self.students.count() >= self.max_capacity
    

class Schedule(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    payment = models.IntegerField(max_length=10, null=True, blank=True)
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(group__isnull=False, student__isnull=True) |
                    models.Q(group__isnull=True, student__isnull=False)
                ),
                name='schedule_group_or_student'
            )
        ]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
        
        if self.group and self.student:
            raise ValidationError("Schedule can't be for both group and individual student")
        
        if not self.group and not self.student:
            raise ValidationError("Schedule must be assigned to either a group or student")
        

class GroupStudent(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='students')
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'group']

    def __str__(self):
        return f"{self.student.name} in {self.group.name}"