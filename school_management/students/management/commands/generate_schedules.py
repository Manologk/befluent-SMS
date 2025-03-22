from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Schedule, Teacher, Student, Group
from datetime import time
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Generate mock schedule data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--schedules',
            type=int,
            default=10,
            help='Number of schedules to generate'
        )

    def handle(self, *args, **options):
        num_schedules = options['schedules']
        
        # Get available teachers, students, and groups
        teachers = list(Teacher.objects.all())
        students = list(Student.objects.filter(student_type='PRIVATE'))
        groups = list(Group.objects.all())
        
        if not teachers:
            self.stdout.write(self.style.ERROR('No teachers found. Please run populate_db first.'))
            return
        
        # Common class times
        class_times = [
            (time(9, 0), time(10, 30)),   # 9:00 - 10:30
            (time(11, 0), time(12, 30)),  # 11:00 - 12:30
            (time(13, 0), time(14, 30)),  # 13:00 - 14:30
            (time(15, 0), time(16, 30)),  # 15:00 - 16:30
            (time(17, 0), time(18, 30)),  # 17:00 - 18:30
            (time(19, 0), time(20, 30)),  # 19:00 - 20:30
        ]
        
        # Common schedule patterns
        schedule_patterns = [
            [0, 2, 4],      # Monday, Wednesday, Friday
            [1, 3],         # Tuesday, Thursday
            [0, 3],         # Monday, Thursday
            [1, 4],         # Tuesday, Friday
            [0, 2],         # Monday, Wednesday
            [2, 4],         # Wednesday, Friday
            [5],            # Saturday only
            [6],            # Sunday only
            [1, 3, 5],      # Tuesday, Thursday, Saturday
            [0, 2, 4, 5],   # Monday, Wednesday, Friday, Saturday
        ]

        schedules_created = 0
        
        # Create schedules
        for _ in range(num_schedules):
            teacher = random.choice(teachers)
            
            # Randomly choose between private and group lessons
            is_private = random.choice([True, False])
            
            if is_private and students:
                # Create private lesson schedule
                student = random.choice(students)
                group = None
                payment = Decimal('50.00')  # Standard private lesson rate
            elif groups:
                # Create group lesson schedule
                student = None
                group = random.choice(groups)
                payment = Decimal('25.00')  # Standard group lesson rate
            else:
                self.stdout.write(self.style.ERROR('No students or groups available'))
                continue
            
            # Select random time slot and days
            start_time, end_time = random.choice(class_times)
            days = random.choice(schedule_patterns)
            
            try:
                schedule = Schedule.objects.create(
                    teacher=teacher,
                    student=student,
                    group=group,
                    days=days,
                    start_time=start_time,
                    end_time=end_time,
                    payment=payment,
                    is_recurring=True
                )
                
                schedules_created += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created schedule {schedule.id}: '
                        f'{"Private" if is_private else "Group"} lessons '
                        f'at {start_time.strftime("%H:%M")}'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create schedule: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {schedules_created} schedules'
            )
        )
        
        # Generate sessions for next week
        self.stdout.write('Generating sessions for next week...')
        sessions_created = 0
        
        for schedule in Schedule.objects.all():
            sessions = schedule.generate_next_session()
            if sessions:
                sessions_created += len(sessions)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully generated {sessions_created} sessions'
            )
        )
