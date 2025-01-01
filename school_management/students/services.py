from django.core.exceptions import ValidationError
from .manager import ScheduleManager, GroupManager
from .models import *
from django.utils import timezone
from datetime import datetime, timedelta


class ClassManagementService:
    @staticmethod
    def create_session_from_schedule(schedule, date):
        """
        Creates a session for a specific date based on a schedule
        """
        session = Session(
            date=date,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            language=schedule.student.level.split('_')[0] if schedule.student else schedule.group.students.first().student.level.split('_')[0],
            level=schedule.student.level.split('_')[1] if schedule.student else schedule.group.students.first().student.level.split('_')[1],
            type='PRIVATE' if schedule.student else 'GROUP',
            student=schedule.student,
            group=schedule.group,
            teacher=schedule.teacher,
            is_online=False,
            manually_activated=False
        )
        session.save()
        return session

    @staticmethod
    def assign_teacher_to_group(teacher, group, schedule_data):
        """
        Assigns a teacher to a group and creates their schedule
        """
        if group.teacher:
            raise ValidationError("Group already has a teacher assigned")

        # Validate schedule
        schedule = ScheduleManager.create_schedule(
            teacher=teacher,
            start_time=schedule_data['start_time'],
            end_time=schedule_data['end_time'],
            day=schedule_data['day'],
            group=group
        )

        group.teacher = teacher
        group.save()

        # Create session for the next occurrence of this schedule
        today = timezone.now().date()
        days_ahead = schedule_data['day'] - today.weekday()
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
        next_session_date = today + timedelta(days=days_ahead)
        
        ClassManagementService.create_session_from_schedule(schedule, next_session_date)

        return schedule

    @staticmethod
    def assign_private_teacher(teacher, student, schedule_data):
        """
        Assigns a teacher to a private student and creates their schedule
        """
        if student.student_type != 'PRIVATE':
            raise ValidationError("Only private students can be assigned individual teachers")

        # Create private lesson schedule
        schedule = ScheduleManager.create_schedule(
            teacher=teacher,
            start_time=schedule_data['start_time'],
            end_time=schedule_data['end_time'],
            day=schedule_data['day'],
            student=student
        )

        # Create session for the next occurrence of this schedule
        today = timezone.now().date()
        days_ahead = schedule_data['day'] - today.weekday()
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
        next_session_date = today + timedelta(days=days_ahead)
        
        ClassManagementService.create_session_from_schedule(schedule, next_session_date)

        return schedule
