from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Schedule
from datetime import timedelta


class Command(BaseCommand):
    help = 'Generate sessions for the upcoming weeks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--weeks',
            type=int,
            default=2,
            help='Number of weeks ahead to generate sessions for'
        )

    def handle(self, *args, **options):
        weeks_ahead = options['weeks']
        today = timezone.now().date()
        end_date = today + timedelta(weeks=weeks_ahead)
        
        self.stdout.write(f'Generating sessions from {today} to {end_date}')
        
        # Get all active schedules
        schedules = Schedule.objects.filter(is_recurring=True)
        self.stdout.write(f'Found {schedules.count()} active schedules')
        
        sessions_created = 0
        current_date = today
        
        # Generate sessions for each day in the range
        while current_date <= end_date:
            weekday = current_date.weekday()
            
            # Find schedules that should have sessions on this day
            day_schedules = schedules.filter(days__contains=[weekday])
            
            for schedule in day_schedules:
                sessions = schedule.generate_next_session(target_date=current_date)
                if sessions:
                    sessions_created += len(sessions)
            
            current_date += timedelta(days=1)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully generated {sessions_created} sessions for the next {weeks_ahead} weeks'
            )
        )
