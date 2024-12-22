from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from students.models import Student, Session, AttendanceLog, Performance, SubscriptionPlan, StudentSubscription
from parents.models import Parent, ParentStudentLink
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Cleans all data from the database while preserving the structure'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Delete data in reverse order of dependencies
            self.stdout.write('Cleaning database...')
            
            # Delete notifications
            Notification.objects.all().delete()
            self.stdout.write('Deleted all notifications')
            
            # Delete student related data
            StudentSubscription.objects.all().delete()
            self.stdout.write('Deleted all student subscriptions')
            
            Performance.objects.all().delete()
            self.stdout.write('Deleted all performance records')
            
            AttendanceLog.objects.all().delete()
            self.stdout.write('Deleted all attendance logs')
            
            Session.objects.all().delete()
            self.stdout.write('Deleted all sessions')
            
            SubscriptionPlan.objects.all().delete()
            self.stdout.write('Deleted all subscription plans')
            
            # Delete parent-student links
            ParentStudentLink.objects.all().delete()
            self.stdout.write('Deleted all parent-student links')
            
            # Delete parents and students
            Parent.objects.all().delete()
            self.stdout.write('Deleted all parents')
            
            Student.objects.all().delete()
            self.stdout.write('Deleted all students')
            
            # Delete all users except superuser
            User.objects.exclude(is_superuser=True).delete()
            self.stdout.write('Deleted all non-superuser users')

            self.stdout.write(self.style.SUCCESS('Successfully cleaned database'))
