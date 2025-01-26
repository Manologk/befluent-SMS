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
from django.db.models import ProtectedError


class Command(BaseCommand):
    help = 'Cleans all data from the database while preserving the structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Running in dry-run mode - no actual deletions will occur'))
        
        try:
            with transaction.atomic():
                self.stdout.write('Starting database cleanup...')
                
                models_to_clean = [
                    (Notification, 'notifications'),
                    (AttendanceLog, 'attendance logs'),
                    (Performance, 'performance records'),
                    (StudentSubscription, 'student subscriptions'),
                    (Session, 'sessions'),
                    (Schedule, 'schedules'),
                    (GroupStudent, 'group students'),
                    (Group, 'groups'),
                    (SubscriptionPlan, 'subscription plans'),
                    (ParentStudentLink, 'parent-student links'),
                    (Parent, 'parents'),
                    (Student, 'students'),
                    (Teacher, 'teachers'),
                ]

                total_deleted = 0
                for model, name in models_to_clean:
                    deleted = self.delete_model(model, name, dry_run)
                    total_deleted += deleted

                # Handle users separately to preserve superusers
                user_count = User.objects.exclude(is_superuser=True).count()
                if not dry_run:
                    User.objects.exclude(is_superuser=True).delete()
                total_deleted += user_count
                self.stdout.write(f'{"Would delete" if dry_run else "Deleted"} {user_count} non-superuser users')

                if dry_run:
                    self.stdout.write(
                        self.style.SUCCESS(f'Dry run complete. Would delete {total_deleted} total records')
                    )
                    # Roll back the transaction in dry-run mode
                    transaction.set_rollback(True)
                else:
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully cleaned database. Deleted {total_deleted} total records')
                    )
                
        except ProtectedError as e:
            self.stdout.write(
                self.style.ERROR(f'Cannot delete some records due to protected references: {str(e)}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error cleaning database: {str(e)}')
            )
    
    def delete_model(self, model, name, dry_run=False):
        """Helper method to delete all instances of a model and log the count"""
        count = model.objects.count()
        if not dry_run:
            model.objects.all().delete()
        self.stdout.write(f'{"Would delete" if dry_run else "Deleted"} {count} {name}')
        return count
