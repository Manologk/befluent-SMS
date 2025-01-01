from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Schedule
from datetime import timedelta

class Command(BaseCommand):
    help = 'Generate sessions for upcoming week based on schedules'

    def handle(self, *args, **options):
        today = timezone.now().date()
        end_date = today + timedelta(days=7)
        
        schedules = Schedule.objects.all()
        sessions_created = 0
        
        for schedule in schedules:
            # Generate session for next occurrence
            session = schedule.generate_next_session()
            if session:
                sessions_created += 1
                self.stdout.write(f"Created session for schedule {schedule.id} on {session.date}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated {sessions_created} sessions')
        ) 