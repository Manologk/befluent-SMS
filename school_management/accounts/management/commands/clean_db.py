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
import sys


class Command(BaseCommand):
    help = 'Cleans all data from the database while preserving the structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt',
        )
        parser.add_argument(
            '--preserve-admin',
            action='store_true',
            help='Preserve superuser accounts',
            default=True,
        )

    def get_user_confirmation(self):
        """Get user confirmation before proceeding with deletion"""
        self.stdout.write(self.style.WARNING(
            '\nWARNING: This will delete ALL data from your database!\n'
            'This action cannot be undone!\n'
        ))
        while True:
            response = input('Are you sure you want to proceed? (yes/no): ').lower()
            if response in ['yes', 'y']:
                return True
            if response in ['no', 'n']:
                return False
            self.stdout.write('Please answer yes or no')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        preserve_admin = options['preserve_admin']
        
        if not (dry_run or force):
            if not self.get_user_confirmation():
                self.stdout.write(self.style.NOTICE('Operation cancelled by user'))
                sys.exit(0)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Running in dry-run mode - no actual deletions will occur'))
        
        try:
            with transaction.atomic():
                self.stdout.write(self.style.NOTICE('Starting database cleanup...'))
                
                # Define models to clean in order of dependencies
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
                    try:
                        deleted = self.delete_model(model, name, dry_run)
                        total_deleted += deleted
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Error deleting {name}: {str(e)}')
                        )

                # Handle users separately to preserve superusers if requested
                user_query = User.objects.all()
                if preserve_admin:
                    user_query = user_query.exclude(is_superuser=True)
                
                user_count = user_query.count()
                if not dry_run:
                    user_query.delete()
                self.stdout.write(
                    f'{"Would delete" if dry_run else "Deleted"} {user_count} '
                    f'{"non-superuser " if preserve_admin else ""}users'
                )
                total_deleted += user_count

                if dry_run:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Dry run complete. Would delete {total_deleted} total records'
                        )
                    )
                    # Roll back the transaction in dry-run mode
                    transaction.set_rollback(True)
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully cleaned database. Deleted {total_deleted} total records'
                        )
                    )
                
        except ProtectedError as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Cannot delete some records due to protected references: {str(e)}'
                )
            )
            transaction.set_rollback(True)
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error cleaning database: {str(e)}')
            )
            transaction.set_rollback(True)
            raise
    
    def delete_model(self, model, name, dry_run=False):
        """Helper method to delete all instances of a model and log the count"""
        try:
            count = model.objects.count()
            if not dry_run and count > 0:
                model.objects.all().delete()
            self.stdout.write(
                f'{"Would delete" if dry_run else "Deleted"} {count} {name}'
            )
            return count
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error processing {name}: {str(e)}')
            )
            return 0
