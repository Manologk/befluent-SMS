from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from students.models import Session, Student, AttendanceLog
import random

class Command(BaseCommand):
    help = 'Populates the database with sample attendance logs'

    def handle(self, *args, **kwargs):
        # Get all sessions from the last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        sessions = Session.objects.filter(
            date__range=[start_date, end_date]
        ).select_related('student', 'group', 'teacher')

        attendance_statuses = ['present', 'absent', 'late']
        attendance_logs_created = 0

        for session in sessions:
            # Get students for this session
            students = []
            if session.type == 'PRIVATE' and session.student:
                students = [session.student]
            elif session.type == 'GROUP' and session.group:
                students = [gs.student for gs in session.group.students.all()]

            for student in students:
                # Check if attendance log already exists
                existing_log = AttendanceLog.objects.filter(
                    session=session,
                    student=student
                ).first()

                if not existing_log:
                    # Generate random attendance status
                    status = random.choices(
                        attendance_statuses,
                        weights=[0.7, 0.2, 0.1],  # 70% present, 20% absent, 10% late
                        k=1
                    )[0]

                    # Generate scanned time for present and late students
                    scanned_at = None
                    if status in ['present', 'late']:
                        base_time = datetime.combine(session.date, session.start_time)
                        if status == 'present':
                            # Scan time between 10 minutes before and exactly at start time
                            minutes_delta = random.randint(-10, 0)
                        else:  # late
                            # Scan time between 1 and 15 minutes after start time
                            minutes_delta = random.randint(1, 15)
                        
                        scanned_at = base_time + timedelta(minutes=minutes_delta)
                        scanned_at = timezone.make_aware(scanned_at)

                    # Create attendance log
                    AttendanceLog.objects.create(
                        session=session,
                        student=student,
                        status=status,
                        scanned_at=scanned_at
                    )
                    attendance_logs_created += 1

                    self.stdout.write(
                        f"Created attendance log for student ID {student.id} in session on {session.date} - {status}"
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {attendance_logs_created} attendance logs')
        )
