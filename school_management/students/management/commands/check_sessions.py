from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Schedule, Session
from datetime import datetime

class Command(BaseCommand):
    help = 'Check and display session information for debugging'

    def handle(self, *args, **options):
        today = timezone.now().date()
        self.stdout.write(f"Checking sessions for date: {today}")

        # Get all schedules
        schedules = Schedule.objects.all()
        self.stdout.write(f"Found {schedules.count()} schedules")

        for schedule in schedules:
            self.stdout.write(f"\nSchedule ID: {schedule.id}")
            self.stdout.write(f"Teacher: {schedule.teacher.name}")
            self.stdout.write(f"Day: {schedule.day}")
            
            # Get sessions for this schedule
            sessions = Session.objects.filter(schedule=schedule)
            self.stdout.write(f"Found {sessions.count()} sessions")
            
            for session in sessions:
                self.stdout.write(f"- Session ID: {session.id}, Date: {session.date}") 