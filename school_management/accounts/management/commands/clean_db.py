from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from students.models import (
    Student, Teacher, Group, Schedule, Session,
    AttendanceLog, Performance, SubscriptionPlan,
    StudentSubscription, GroupStudent
)
from parents.models import Parent, ParentStudentLink
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Cleans all data from the database while preserving the structure'

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                self.stdout.write('Cleaning database...')
                
                # Delete notifications first
                self.delete_model(Notification, 'notifications')
                
                # Delete attendance and performance records
                self.delete_model(AttendanceLog, 'attendance logs')
                self.delete_model(Performance, 'performance records')
                
                # Delete student subscriptions
                self.delete_model(StudentSubscription, 'student subscriptions')
                
                # Delete sessions
                self.delete_model(Session, 'sessions')
                
                # Delete schedules
                self.delete_model(Schedule, 'schedules')
                
                # Delete group students
                self.delete_model(GroupStudent, 'group students')
                
                # Delete groups
                self.delete_model(Group, 'groups')
                
                # Delete subscription plans
                self.delete_model(SubscriptionPlan, 'subscription plans')
                
                # Delete parent-student links
                self.delete_model(ParentStudentLink, 'parent-student links')
                
                # Delete parents
                self.delete_model(Parent, 'parents')
                
                # Delete students and teachers
                self.delete_model(Student, 'students')
                self.delete_model(Teacher, 'teachers')
                
                # Delete all users except superuser
                User.objects.exclude(is_superuser=True).delete()
                self.stdout.write('Deleted all non-superuser users')
                
                self.stdout.write(self.style.SUCCESS('Successfully cleaned database'))
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error cleaning database: {str(e)}')
            )
    
    def delete_model(self, model, name):
        """Helper method to delete all instances of a model and log the count"""
        count = model.objects.count()
        model.objects.all().delete()
        self.stdout.write(f'Deleted {count} {name}')
