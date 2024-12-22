from django.db import transaction
from django.core.exceptions import ValidationError
from .models import *
from datetime import datetime, time


class ScheduleManager:
    @staticmethod
    def check_schedule_conflict(teacher, start_time, end_time, day, exclude_id=None):
        Schedule = Schedule.objects.filter(
            teacher = teacher,
            day=day
        ).exclude(id=exclude_id)

        for schedule in schedule:
            if (start_time < schedule.end_time > schedule.start_time):
                return True
        return False
    
    def create_schedule(teacher, start_time, end_time, day, group=None, student=None):
        if ScheduleManager.check_schedule_conflict(teacher, start_time, end_time, day):
            raise ValidationError("Schedule conflicts with existing appointments")
        
        schedule = Schedule(
            teacher=teacher,
            start_time=start_time,
            end_time=end_time,
            day=day,
            group=group,
            student=student
        )
        schedule.full_clean()
        schedule.save()
        return schedule


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
        
        if student.student_type != 'GROUP':
            raise ValidationError("Only group students can be added to groups")
        
        with transaction.atomic():
            group_student = GroupStudent(student=student, group=group)
            group_student.full_clean()
            group_student.save()
            return group_student
        
    
    @staticmethod
    def remove_student_from_group(student, group):
        GroupStudent.objects.filter(student=student,)

