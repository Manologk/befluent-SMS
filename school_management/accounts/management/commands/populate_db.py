from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from students.models import (
    Student, Teacher, Group, Schedule, Session,
    AttendanceLog, Performance, SubscriptionPlan,
    StudentSubscription, GroupStudent
)
from parents.models import Parent, ParentStudentLink
from django.utils import timezone
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Populates the database with mock data including Russian names'

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                self.stdout.write('Creating mock data...')
                
                # Create subscription plans
                plans = self.create_subscription_plans()
                
                # Create users and related profiles
                admin = self.create_admin()
                teachers = self.create_teachers(3)
                students = self.create_students(10)
                parents = self.create_parents(5)
                
                # Create groups and schedules
                groups = self.create_groups(teachers)
                self.assign_students_to_groups(students, groups)
                self.create_schedules(groups, teachers, students)
                
                # Create sessions and attendance
                sessions = self.create_sessions()
                self.create_attendance_logs(students, sessions)
                self.create_performance_records(students, sessions)
                
                # Create student subscriptions
                self.create_student_subscriptions(students, plans)
                
                # Link parents to students
                self.link_parents_to_students(parents, students)
                
                self.stdout.write(self.style.SUCCESS('Successfully created mock data'))
                
                # Print summary
                self.print_summary()
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating mock data: {e}'))

    def create_subscription_plans(self):
        plans = [
            SubscriptionPlan.objects.create(
                name='Базовый План',
                number_of_lessons=8,
                price=14999.99
            ),
            SubscriptionPlan.objects.create(
                name='Стандартный План',
                number_of_lessons=12,
                price=19999.99
            ),
            SubscriptionPlan.objects.create(
                name='Премиум План',
                number_of_lessons=16,
                price=24999.99
            )
        ]
        return plans

    def create_admin(self):
        admin_user = User.objects.create_superuser(
            email='admin@befluent.com',
            password='admin123',
            role='admin'
        )
        return admin_user

    def create_teachers(self, count):
        teachers = []
        teacher_names = [
            'Анна Петрова',
            'Михаил Иванов',
            'Елена Смирнова'
        ]
        specializations = [
            ['English', 'IELTS'],
            ['English', 'TOEFL'],
            ['English', 'Business English']
        ]
        
        for i in range(count):
            user = User.objects.create_user(
                email=f'teacher{i+1}@befluent.com',
                password='teacher123',
                role='instructor'
            )
            teacher = Teacher.objects.create(
                user=user,
                name=teacher_names[i],
                email=f'teacher{i+1}@befluent.com',
                specializations=specializations[i]
            )
            teachers.append(teacher)
        return teachers

    def create_students(self, count):
        students = []
        student_names = [
            'Александр Волков', 'Мария Козлова', 'Дмитрий Соколов',
            'София Морозова', 'Артём Лебедев', 'Анастасия Новикова',
            'Иван Попов', 'Екатерина Соловьева', 'Максим Васильев',
            'Полина Кузнецова'
        ]
        student_types = ['GROUP', 'PRIVATE']
        levels = ['Beginner', 'Intermediate', 'Advanced']
        
        for i in range(count):
            user = User.objects.create_user(
                email=f'student{i+1}@befluent.com',
                password='student123',
                role='student'
            )
            student = Student.objects.create(
                user=user,
                name=student_names[i],
                email=f'student{i+1}@befluent.com',
                phone_number=f'+7495555{i:04d}',
                student_type=random.choice(student_types),
                level=random.choice(levels),
                subscription_balance=random.randint(5000, 50000),
                lessons_remaining=random.randint(0, 20)
            )
            student.generate_qr_code()
            students.append(student)
        return students

    def create_parents(self, count):
        parents = []
        parent_names = [
            'Сергей Иванов', 'Ольга Петрова', 'Андрей Сидоров',
            'Татьяна Морозова', 'Владимир Козлов'
        ]
        for i in range(count):
            user = User.objects.create_user(
                email=f'parent{i+1}@befluent.com',
                password='parent123',
                role='parent'
            )
            parent = Parent.objects.create(
                user=user,
                name=parent_names[i],
                email=f'parent{i+1}@befluent.com',
                phone_number=f'+7495777{i:04d}'
            )
            parents.append(parent)
        return parents

    def create_groups(self, teachers):
        groups = []
        group_names = ['Группа А1', 'Группа А2', 'Группа B1']
        for i, teacher in enumerate(teachers):
            group = Group.objects.create(
                name=group_names[i],
                teacher=teacher,
                max_capacity=5,
                status='active'
            )
            groups.append(group)
        return groups

    def assign_students_to_groups(self, students, groups):
        for student in students:
            if student.student_type == 'GROUP':
                group = random.choice(groups)
                if not group.is_full():
                    GroupStudent.objects.create(
                        student=student,
                        group=group
                    )

    def create_schedules(self, groups, teachers, students):
        days = list(range(0, 5))  # Monday to Friday
        times = [
            ('09:00', '10:30'),
            ('11:00', '12:30'),
            ('14:00', '15:30'),
            ('16:00', '17:30'),
            ('18:00', '19:30')
        ]
        
        # Group schedules
        for group in groups:
            time_slot = random.choice(times)
            Schedule.objects.create(
                group=group,
                teacher=group.teacher,
                day=random.choice(days),
                start_time=datetime.strptime(time_slot[0], '%H:%M').time(),
                end_time=datetime.strptime(time_slot[1], '%H:%M').time(),
                is_recurring=True
            )
        
        # Private student schedules
        for student in students:
            if student.student_type == 'PRIVATE':
                time_slot = random.choice(times)
                Schedule.objects.create(
                    student=student,
                    teacher=random.choice(teachers),
                    day=random.choice(days),
                    start_time=datetime.strptime(time_slot[0], '%H:%M').time(),
                    end_time=datetime.strptime(time_slot[1], '%H:%M').time(),
                    is_recurring=True
                )

    def create_sessions(self):
        sessions = []
        topics = [
            'Грамматика: Времена',
            'Разговорная практика',
            'Бизнес английский',
            'Подготовка к IELTS',
            'Идиомы и фразовые глаголы'
        ]
        
        # Create sessions for the past 30 days
        for i in range(30):
            session_date = timezone.now().date() - timedelta(days=i)
            session = Session.objects.create(
                date=session_date,
                language='English',
                level=random.choice(['Beginner', 'Intermediate', 'Advanced']),
                topic=random.choice(topics)
            )
            sessions.append(session)
        return sessions

    def create_attendance_logs(self, students, sessions):
        for session in sessions:
            # Randomly select 70% of students for attendance
            attending_students = random.sample(students, k=int(len(students) * 0.7))
            for student in attending_students:
                AttendanceLog.objects.create(
                    student=student,
                    session=session,
                    scanned_at=datetime.combine(
                        session.date,
                        datetime.strptime('14:00', '%H:%M').time()
                    ),
                    valid=True
                )

    def create_performance_records(self, students, sessions):
        comments = [
            'Отличный прогресс',
            'Нужно больше практики',
            'Активное участие в уроке',
            'Хорошо справляется с заданиями',
            'Улучшил(а) произношение'
        ]
        
        for session in sessions:
            attendance_logs = AttendanceLog.objects.filter(session=session)
            for log in attendance_logs:
                Performance.objects.create(
                    student=log.student,
                    session=session,
                    date=session.date,
                    vocabulary_score=random.uniform(60, 100),
                    grammar_score=random.uniform(60, 100),
                    speaking_score=random.uniform(60, 100),
                    listening_score=random.uniform(60, 100),
                    comments=random.choice(comments)
                )

    def create_student_subscriptions(self, students, plans):
        for student in students:
            plan = random.choice(plans)
            start_date = timezone.now().date() - timedelta(days=random.randint(0, 30))
            StudentSubscription.objects.create(
                student=student,
                subscription_plan=plan,
                start_date=start_date,
                end_date=start_date + timedelta(days=30)
            )

    def link_parents_to_students(self, parents, students):
        # Each parent will be linked to 1-3 students
        for parent in parents:
            num_children = random.randint(1, 3)
            children = random.sample(students, k=min(num_children, len(students)))
            for child in children:
                ParentStudentLink.objects.create(
                    parent=parent,
                    student=child
                )

    def print_summary(self):
        """Print a summary of all created data"""
        self.stdout.write('\nDatabase Population Summary:')
        self.stdout.write('-' * 30)
        self.stdout.write(f'Users created:')
        self.stdout.write(f'  - Admin: {User.objects.filter(role="admin").count()}')
        self.stdout.write(f'  - Teachers: {User.objects.filter(role="instructor").count()}')
        self.stdout.write(f'  - Students: {User.objects.filter(role="student").count()}')
        self.stdout.write(f'  - Parents: {User.objects.filter(role="parent").count()}')
        self.stdout.write(f'\nGroups created: {Group.objects.count()}')
        self.stdout.write(f'Schedules created: {Schedule.objects.count()}')
        self.stdout.write(f'Sessions created: {Session.objects.count()}')
        self.stdout.write(f'Attendance logs: {AttendanceLog.objects.count()}')
        self.stdout.write(f'Performance records: {Performance.objects.count()}')
        self.stdout.write(f'Subscription plans: {SubscriptionPlan.objects.count()}')
        self.stdout.write(f'Student subscriptions: {StudentSubscription.objects.count()}')
        self.stdout.write(f'Parent-Student links: {ParentStudentLink.objects.count()}')