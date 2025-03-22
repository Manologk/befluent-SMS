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
    help = 'Populates the database with mock data using simple email addresses'

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                self.stdout.write('Creating mock data...')
                
                # Create subscription plans
                plans = self.create_subscription_plans()
                
                # Create users and related profiles
                admin = self.create_admin()
                teachers = self.create_teachers(5)
                students = self.create_students(15)
                parents = self.create_parents(8)
                
                # Create groups and schedules
                groups = self.create_groups(teachers)
                self.assign_students_to_groups(students, groups)
                self.create_schedules(groups, teachers, students)
                
                # Create sessions and attendance
                sessions = self.create_sessions(teachers, students, groups)
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
            email='admin@skillplus.ru',
            password='admin123',
            role='admin'
        )
        return admin_user

    def create_teachers(self, count):
        teachers = []
        teacher_names = [
            'Анна Петрова', 'Михаил Иванов', 'Елена Смирнова',
            'Ольга Кузнецова', 'Дмитрий Попов', 'Наталья Волкова',
            'Сергей Морозов', 'Татьяна Соколова'
        ]
        specializations = [
            ['English', 'IELTS'], ['English', 'TOEFL'],
            ['English', 'Business English'], ['English', 'General English'],
            ['English', 'Academic English'], ['English', 'Conversational English'],
            ['English', 'Cambridge Exams'], ['English', 'Young Learners']
        ]
        
        for i in range(count):
            email = f'teacher{i+1}@skillplus.ru'
            user = User.objects.create_user(
                email=email,
                password='teacher123',
                role='instructor'
            )
            teacher = Teacher.objects.create(
                user=user,
                name=teacher_names[i],
                email=email,
                specializations=specializations[i]
            )
            teachers.append(teacher)
            self.stdout.write(f'Created teacher: {email} / teacher123')
        return teachers

    def create_students(self, count):
        students = []
        student_names = [
            'Александр Волков', 'Мария Козлова', 'Дмитрий Соколов',
            'София Морозова', 'Артём Лебедев', 'Анастасия Новикова',
            'Иван Попов', 'Екатерина Соловьева', 'Максим Васильев',
            'Полина Кузнецова', 'Кирилл Николаев', 'Алиса Федорова',
            'Даниил Михайлов', 'Виктория Андреева', 'Тимофей Егоров',
            'Арина Павлова', 'Марк Захаров', 'Вера Степанова'
        ]
        levels = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']
        
        for i in range(count):
            email = f'student{i+1}@skillplus.ru'
            user = User.objects.create_user(
                email=email,
                password='student123',
                role='student'
            )
            student = Student.objects.create(
                user=user,
                name=student_names[i],
                email=email,
                phone_number=f'+7495555{i:04d}',
                level=random.choice(levels),
                subscription_balance=random.randint(5000, 50000),
                lessons_remaining=random.randint(0, 20)
            )
            student.generate_qr_code()
            students.append(student)
            self.stdout.write(f'Created student: {email} / student123')
        return students

    def create_parents(self, count):
        parents = []
        parent_names = [
            'Сергей Иванов', 'Ольга Петрова', 'Андрей Сидоров',
            'Татьяна Морозова', 'Владимир Козлов', 'Людмила Новикова',
            'Игорь Соколов', 'Марина Волкова', 'Алексей Лебедев',
            'Евгения Попова'
        ]
        for i in range(count):
            email = f'parent{i+1}@skillplus.ru'
            user = User.objects.create_user(
                email=email,
                password='parent123',
                role='parent'
            )
            parent = Parent.objects.create(
                user=user,
                name=parent_names[i],
                email=email,
                phone_number=f'+7495777{i:04d}'
            )
            parents.append(parent)
            self.stdout.write(f'Created parent: {email} / parent123')
        return parents

    def create_groups(self, teachers):
        groups = []
        group_names = [
            'Группа А1', 'Группа А2', 'Группа B1', 
            'Группа B2', 'Группа C1', 'Группа Kids'
        ]
        for i, teacher in enumerate(teachers):
            if i < len(group_names):
                group = Group.objects.create(
                    name=group_names[i],
                    teacher=teacher,
                    max_capacity=5,
                    status='active'
                )
                groups.append(group)
        return groups

    def assign_students_to_groups(self, students, groups):
        """Assign students to groups randomly"""
        for student in students:
            # Randomly decide if student should be in a group (70% chance)
            if random.random() < 0.7:
                # Try to find a group that's not full
                available_groups = [g for g in groups if not g.is_full()]
                if available_groups:
                    group = random.choice(available_groups)
                    GroupStudent.objects.create(
                        student=student,
                        group=group
                    )
                    self.stdout.write(f'Assigned {student.name} to {group.name}')

    def create_schedules(self, groups, teachers, students):
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
            # Create schedule with 2-3 days per week
            days = random.sample(range(0, 5), random.randint(2, 3))  # Monday to Friday
            schedule = Schedule.objects.create(
                group=group,
                teacher=group.teacher,
                days=days,
                start_time=datetime.strptime(time_slot[0], '%H:%M').time(),
                end_time=datetime.strptime(time_slot[1], '%H:%M').time(),
                is_recurring=True,
                payment=random.randint(3000, 6000)
            )
        
        # Individual schedules
        for student in students:
            time_slot = random.choice(times)
            # Create schedule with 1-2 days per week
            days = random.sample(range(0, 5), random.randint(1, 2))
            Schedule.objects.create(
                student=student,
                teacher=random.choice(teachers),
                days=days,
                start_time=datetime.strptime(time_slot[0], '%H:%M').time(),
                end_time=datetime.strptime(time_slot[1], '%H:%M').time(),
                is_recurring=True,
                payment=random.randint(4000, 8000)
            )

    def create_sessions(self, teachers, students, groups):
        sessions = []
        today = timezone.now().date()
        session_statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        
        # Create sessions for each group schedule
        group_schedules = Schedule.objects.filter(group__isnull=False)
        for schedule in group_schedules:
            for i in range(3):  # 3 sessions per schedule
                session = Session.objects.create(
                    schedule=schedule,
                    date=today + timedelta(days=i),
                    start_time=schedule.start_time,
                    end_time=schedule.end_time,
                    type='GROUP',
                    group=schedule.group,
                    teacher=schedule.teacher,
                    payment=schedule.payment,
                    status=random.choice(session_statuses)
                )
                sessions.append(session)
        
        # Create sessions for individual schedules
        individual_schedules = Schedule.objects.filter(student__isnull=False)
        for schedule in individual_schedules:
            session = Session.objects.create(
                schedule=schedule,
                date=today,
                start_time=schedule.start_time,
                end_time=schedule.end_time,
                type='PRIVATE',
                student=schedule.student,
                teacher=schedule.teacher,
                payment=schedule.payment,
                status=random.choice(session_statuses)
            )
            sessions.append(session)
        
        return sessions

    def create_attendance_logs(self, students, sessions):
        attendance_statuses = ['present', 'absent', 'late']
        for session in sessions:
            if session.type == 'GROUP' and session.group:
                group_students = GroupStudent.objects.filter(group=session.group)
                for group_student in group_students:
                    status = random.choices(
                        attendance_statuses, 
                        weights=[0.7, 0.2, 0.1]  # 70% present, 20% absent, 10% late
                    )[0]
                    AttendanceLog.objects.create(
                        student=group_student.student,
                        session=session,
                        valid=status == 'present',
                        status=status
                    )
            elif session.type == 'PRIVATE' and session.student:
                status = random.choices(
                    attendance_statuses,
                    weights=[0.8, 0.1, 0.1]  # 80% present, 10% absent, 10% late for private lessons
                )[0]
                AttendanceLog.objects.create(
                    student=session.student,
                    session=session,
                    valid=status == 'present',
                    status=status
                )

    def create_performance_records(self, students, sessions):
        for session in sessions:
            if session.type == 'GROUP' and session.group:
                group_students = GroupStudent.objects.filter(group=session.group)
                for group_student in group_students:
                    self._create_performance(group_student.student, session)
            elif session.type == 'PRIVATE' and session.student:
                self._create_performance(session.student, session)

    def _create_performance(self, student, session):
        Performance.objects.create(
            student=student,
            session=session,
            date=session.date,
            vocabulary_score=random.uniform(60, 100),
            grammar_score=random.uniform(60, 100),
            speaking_score=random.uniform(60, 100),
            listening_score=random.uniform(60, 100),
            comments=random.choice([
                'Отличная работа на уроке!',
                'Нужно больше практики в разговорной речи',
                'Хорошее понимание грамматики',
                'Улучшилось произношение'
            ])
        )

    def create_student_subscriptions(self, students, plans):
        today = timezone.now().date()
        for student in students:
            plan = random.choice(plans)
            StudentSubscription.objects.create(
                student=student,
                subscription_plan=plan,
                start_date=today - timedelta(days=random.randint(0, 30)),
                end_date=today + timedelta(days=random.randint(30, 90))
            )

    def link_parents_to_students(self, parents, students):
        # Each parent gets 1-2 students
        for parent in parents:
            num_children = random.randint(1, 2)
            available_students = list(students)
            for _ in range(num_children):
                if available_students:
                    student = random.choice(available_students)
                    available_students.remove(student)
                    ParentStudentLink.objects.create(
                        parent=parent,
                        student=student
                    )

    def print_summary(self):
        self.stdout.write("\nDatabase Population Summary:")
        self.stdout.write(f"Users: {User.objects.count()}")
        self.stdout.write(f"Teachers: {Teacher.objects.count()}")
        self.stdout.write(f"Students: {Student.objects.count()}")
        self.stdout.write(f"Parents: {Parent.objects.count()}")
        self.stdout.write(f"Groups: {Group.objects.count()}")
        self.stdout.write(f"Sessions: {Session.objects.count()}")
        self.stdout.write(f"Attendance Logs: {AttendanceLog.objects.count()}")
        self.stdout.write(f"Performance Records: {Performance.objects.count()}")
        self.stdout.write(f"Student Subscriptions: {StudentSubscription.objects.count()}")
        self.stdout.write(f"Parent-Student Links: {ParentStudentLink.objects.count()}") 