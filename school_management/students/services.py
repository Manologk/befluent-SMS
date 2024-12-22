from django.core.exceptions import ValidationError
from .manager import ScheduleManager, GroupManager
from .models import *


class ClassManagementService:
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

        return schedule
