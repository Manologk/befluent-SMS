from django.db import transaction
from django.core.exceptions import ValidationError
from .models import *
from datetime import datetime, time, timedelta
from django.utils import timezone


class ScheduleManager:
    @staticmethod
    def check_schedule_conflict(teacher, start_time, end_time, day, exclude_id=None):
        # Convert string times to time objects if they're strings
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, '%H:%M').time()
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, '%H:%M').time()

        existing_schedules = Schedule.objects.filter(
            teacher=teacher,
            days__contains=[day]
        ).exclude(id=exclude_id)

        for schedule in existing_schedules:
            if (start_time < schedule.end_time and end_time > schedule.start_time):
                return True
        return False
    
    @staticmethod
    def create_schedule(teacher, start_time, end_time, days, group=None, student=None, payment=0, is_recurring=True):
        # Convert string times to time objects if they're strings
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, '%H:%M').time()
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, '%H:%M').time()

        # Check for conflicts on each day
        for day in days:
            if ScheduleManager.check_schedule_conflict(teacher, start_time, end_time, day):
                raise ValidationError(f"Schedule conflicts with existing appointments on day {day}")
        
        schedule = Schedule(
            teacher=teacher,
            start_time=start_time,
            end_time=end_time,
            days=days,
            group=group,
            student=student,
            payment=payment,
            is_recurring=is_recurring
        )
        schedule.full_clean()
        schedule.save()

        # Create initial sessions
        ScheduleManager.create_sessions_for_schedule(schedule)
        
        return schedule

    @staticmethod
    def create_sessions_for_schedule(schedule):
        """Creates sessions for the next 4 weeks based on the schedule"""
        today = timezone.now().date()
        end_date = today + timedelta(weeks=4)
        
        with transaction.atomic():
            # If it's a group schedule, create sessions for each student in the group
            if schedule.group:
                group_students = GroupStudent.objects.filter(group=schedule.group)
                for day in schedule.days:
                    current_date = today
                    while current_date <= end_date:
                        if current_date.weekday() == day:
                            session = Session(
                                schedule=schedule,
                                teacher=schedule.teacher,
                                group=schedule.group,
                                date=current_date,
                                start_time=schedule.start_time,
                                end_time=schedule.end_time,
                                type='GROUP',
                                payment=schedule.payment,
                                status='SCHEDULED'
                            )
                            session.save()
                        current_date += timedelta(days=1)
            
            # If it's a private student schedule
            elif schedule.student:
                for day in schedule.days:
                    current_date = today
                    while current_date <= end_date:
                        if current_date.weekday() == day:
                            session = Session(
                                schedule=schedule,
                                teacher=schedule.teacher,
                                student=schedule.student,
                                date=current_date,
                                start_time=schedule.start_time,
                                end_time=schedule.end_time,
                                type='PRIVATE',
                                payment=schedule.payment,
                                status='SCHEDULED'
                            )
                            session.save()
                        current_date += timedelta(days=1)


class GroupManager:
    @staticmethod
    def create_group(name, teacher, max_capacity):
        group = Group(
            name=name,
            teacher=teacher,
            max_capacity=max_capacity
        )
        group.full_clean()
        group.save()
        return group
    
    @staticmethod
    def add_student_to_group(student, group):
        if group.is_full():
            raise ValidationError("Group has reached maximum capacity")
        
        # Check if student is already in the group
        if GroupStudent.objects.filter(student=student, group=group).exists():
            raise ValidationError("Student is already in this group")
        
        with transaction.atomic():
            group_student = GroupStudent(student=student, group=group)
            group_student.full_clean()
            group_student.save()
            return group_student
    
    @staticmethod
    def remove_student_from_group(student, group):
        try:
            group_student = GroupStudent.objects.get(student=student, group=group)
            group_student.delete()
        except GroupStudent.DoesNotExist:
            raise ValidationError("Student is not in this group")
