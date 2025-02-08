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
    # STUDENT_TYPE_CHOICES = [
    #     ('GROUP', 'Group Student'),
    #     ('PRIVATE', 'Private Student'),
    # ]
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
    # student_type = models.CharField(max_length=10, choices=STUDENT_TYPE_CHOICES)
    level = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    def generate_qr_code(self):
        try:
            # Create minimal QR code data - just the student ID
            qr_data = str(self.id)
            
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
            
            # Save just the student ID as the QR code
            self.qr_code = qr_data
            self.save()
            
            return self.qr_code
            
        except Exception as e:
            print(f"Error generating QR code: {e}")
            raise


class Session(models.Model):
    schedule = models.ForeignKey('Schedule', on_delete=models.CASCADE, related_name='sessions')
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    student = models.ForeignKey('Student', on_delete=models.CASCADE, null=True, blank=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    type = models.CharField(max_length=10, choices=[('GROUP', 'Group'), ('PRIVATE', 'Private')])
    payment = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled')
        ],
        default='IN_PROGRESS'
    )

    def mark_attendance(self, student_id):
        """Mark attendance for a student and process payment"""
        from .models import AttendanceLog, Student
        
        try:
            student = Student.objects.get(id=student_id)
            
            # Check for existing attendance
            existing_attendance = AttendanceLog.objects.filter(
                student=student,
                session=self
            ).first()
            
            if existing_attendance:
                raise ValidationError("Attendance already marked for this student in this session")
            
            # Create attendance log
            attendance = AttendanceLog.objects.create(
                student=student,
                session=self,
                valid=True,
                status='present'
            )
            
            # Deduct lesson and balance
            student.lessons_remaining = models.F('lessons_remaining') - 1
            student.subscription_balance = models.F('subscription_balance') - self.payment
            student.save()
            
            return attendance
            
        except Student.DoesNotExist:
            raise ValueError("Student not found")


class AttendanceLog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)
    valid = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('late', 'Late')
        ],
        default='absent'
    )

    class Meta:
        unique_together = ('student', 'session')

    def __str__(self):
        return f"{self.student.name} - {self.session} - {self.status}"


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
    phone_number = models.CharField(max_length=20, blank=True)
    specializations = models.JSONField(default=list)

    def __str__(self):
        return self.name

    @property
    def teaching_groups(self):
        return Group.objects.filter(teacher=self)


class Group(models.Model):
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Spanish', 'Spanish'),
        ('French', 'French'),
        ('German', 'German'),
        ('Italian', 'Italian'),
        ('Portuguese', 'Portuguese'),
        ('Russian', 'Russian'),
        ('Chinese', 'Chinese'),
        ('Japanese', 'Japanese'),
        ('Korean', 'Korean'),
    ]

    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Elementary', 'Elementary'),
        ('Intermediate', 'Intermediate'),
        ('Upper Intermediate', 'Upper Intermediate'),
        ('Advanced', 'Advanced'),
        ('Proficient', 'Proficient'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('full', 'Full'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='teaching_groups')
    max_capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.language} ({self.level})"

    def is_full(self):
        return self.students.count() >= self.max_capacity


class Schedule(models.Model):
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    student = models.ForeignKey('Student', on_delete=models.CASCADE, null=True, blank=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True, blank=True)
    days = models.JSONField(default=list, help_text='List of weekday numbers (0-6, Monday is 0)')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    payment = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not self.student and not self.group:
            raise ValidationError("Schedule must be associated with either a student or a group")
        if self.student and self.group:
            raise ValidationError("Schedule cannot be associated with both a student and a group")
        
        if not self.days:
            raise ValidationError("At least one day must be selected")
        
        for day in self.days:
            if not isinstance(day, int) or day < 0 or day > 6:
                raise ValidationError("Days must be integers between 0 and 6")
        
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")

    def __str__(self):
        if self.student:
            return f"Private lesson for {self.student.name} with {self.teacher.name}"
        return f"Group lesson for {self.group.name} with {self.teacher.name}"

    def generate_next_session(self, target_date=None):
        """Generate the next session based on this schedule"""
        try:
            if target_date is None:
                target_date = timezone.now().date()
            
            # Check if the target date's weekday is in the schedule's days
            if target_date.weekday() not in self.days:
                return None
            
            # Check if a session already exists for this date
            existing_session = Session.objects.filter(
                schedule=self,
                date=target_date
            ).first()
            
            if existing_session:
                return existing_session
            
            # Create new session
            session = Session.objects.create(
                schedule=self,
                teacher=self.teacher,
                student=self.student,
                group=self.group,
                date=target_date,
                start_time=self.start_time,
                end_time=self.end_time,
                type='GROUP' if self.group else 'PRIVATE',
                payment=self.payment,
                status='IN_PROGRESS'  # Ensure new sessions are active by default
            )
            
            return session
            
        except Exception as e:
            print(f"Error generating session: {e}")
            return None


class GroupStudent(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='students')
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'group']

    def __str__(self):
        return f"{self.student.name} in {self.group.name}"