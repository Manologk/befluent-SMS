from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import *
from .serializers import *
from .services import ClassManagementService
from .manager import *
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Student, AttendanceLog, Session
from rest_framework.views import APIView
from django.db.models import Avg, F, Q
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from datetime import datetime

from django.core.exceptions import ValidationError


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Teacher.objects.prefetch_related(
            'teaching_groups',
            'session_set__student'
        ).all()

    def get_serializer_class(self):
        if self.action == 'create_with_user':
            return CreateTeacherWithUserSerializer
        return TeacherSerializer

    @action(detail=False, methods=['post'], url_path='create-with-user')
    def create_with_user(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        return Response(TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        teacher = self.get_object()
        schedules = Schedule.objects.filter(teacher=teacher)
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def groups(self, request, pk=None):
        teacher = self.get_object()
        groups = Group.objects.filter(teacher=teacher)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return GroupCreateSerializer
        return GroupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            with transaction.atomic():
                group = serializer.save()
                
                # If schedule data is provided, create schedule
                if 'schedule' in request.data:
                    schedule_data = request.data['schedule']
                    ClassManagementService.assign_teacher_to_group(
                        teacher=group.teacher,
                        group=group,
                        schedule_data=schedule_data
                    )
                
                response_serializer = GroupSerializer(group)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_201_CREATED
                )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def add_student(self, request, pk=None):
        group = self.get_object()
        student_id = request.data.get('student_id')
        
        try:
            student = Student.objects.get(id=student_id)
            group_student = GroupManager.add_student_to_group(student, group)
            return Response(
                {'message': f'Student {student.name} added to group {group.name}'},
                status=status.HTTP_200_OK
            )
        except (ValidationError, Student.DoesNotExist) as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def add_students(self, request, pk=None):
        """Add multiple students to a group at once"""
        group = self.get_object()
        student_ids = request.data.get('student_ids', [])
        
        if not isinstance(student_ids, list):
            return Response(
                {'error': 'student_ids must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = []
        with transaction.atomic():
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)
                    group_student = GroupManager.add_student_to_group(student, group)
                    results.append({
                        'student_id': student_id,
                        'status': 'success',
                        'message': f'Student {student.name} added to group {group.name}'
                    })
                except (ValidationError, Student.DoesNotExist) as e:
                    results.append({
                        'student_id': student_id,
                        'status': 'error',
                        'message': str(e)
                    })

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def assign_teacher(self, request, pk=None):
        """Assign a teacher to a group"""
        group = self.get_object()
        teacher_id = request.data.get('teacher_id')
        
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Check if schedule data is provided
            schedule_data = request.data.get('schedule')
            
            with transaction.atomic():
                group.teacher = teacher
                group.save()
                
                # If schedule data is provided, create or update schedule
                if schedule_data:
                    ClassManagementService.assign_teacher_to_group(
                        teacher=teacher,
                        group=group,
                        schedule_data=schedule_data
                    )
                
                return Response({
                    'message': f'Teacher {teacher.name} assigned to group {group.name}',
                    'teacher': TeacherSerializer(teacher).data,
                    'group': GroupSerializer(group).data
                }, status=status.HTTP_200_OK)
                
        except Teacher.DoesNotExist:
            return Response(
                {'error': f'Teacher with id {teacher_id} does not exist'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def remove_teacher(self, request, pk=None):
        """Remove the current teacher from a group"""
        group = self.get_object()
        
        if not group.teacher:
            return Response(
                {'error': 'Group has no teacher assigned'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        with transaction.atomic():
            teacher_name = group.teacher.name
            group.teacher = None
            group.save()
            
            return Response({
                'message': f'Teacher {teacher_name} removed from group {group.name}',
                'group': GroupSerializer(group).data
            }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_student(self, request, pk=None):
        group = self.get_object()
        student_id = request.data.get('student_id')

        try:
            student = Student.objects.get(id=student_id)
            GroupManager.remove_student_from_group(student, group)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create_with_user':
            return CreateStudentWithUserSerializer
        return StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'student':
                # If user is a student, return only their data
                return Student.objects.filter(user=user)
            elif user.role == 'admin':
                # If user is admin, return all students
                return Student.objects.all()
        return Student.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # For single student retrieval
        user = self.request.user
        if user.role == 'student':
            # Get the student instance associated with the user
            try:
                student = Student.objects.get(user=user)
                serializer = self.get_serializer(student)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response(
                    {"error": "Student profile not found"},
                    status=404
                )
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        student = self.get_object()
        schedules = Schedule.objects.filter(
            student=student
        ) | Schedule.objects.filter(
            group__students__student=student
        )
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def groups(self, request, pk=None):
        student = self.get_object()
        groups = Group.objects.filter(students__student=student)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reduce_lesson(self, request, pk=None):
        student = self.get_object()

        # Check if student has remaining lessons
        if student.lessons_remaining <= 0:
            return Response({
                'success': False,
                'message': 'No remaining lessons in subscription'
            }, status=400)

        # Check if student has sufficient balance
        if student.subscription_balance <= 0:
            return Response({
                'success': False,
                'message': 'Insufficient subscription balance'
            }, status=400)

        # Check for existing attendance today
        today = timezone.now().date()
        existing_attendance = AttendanceLog.objects.filter(
            student=student,
            scanned_at__date=today
        ).exists()

        if existing_attendance:
            return Response({
                'success': False,
                'message': 'Attendance already marked for today'
            }, status=400)

        try:
            with transaction.atomic():
                # Get or create today's session
                session, _ = Session.objects.get_or_create(
                    date=today,
                    defaults={
                        'language': student.level.split('_')[0] if '_' in student.level else 'English',
                        'level': student.level.split('_')[1] if '_' in student.level else student.level
                    }
                )

                # Create attendance log
                AttendanceLog.objects.create(
                    student=student,
                    session=session,
                    valid=True
                )

                # Deduct one lesson and update subscription balance
                cost_per_lesson = student.subscription_balance / student.lessons_remaining
                student.lessons_remaining -= 1
                student.subscription_balance = F('subscription_balance') - cost_per_lesson
                student.save()

                # Refresh to get updated values
                student.refresh_from_db()

                return Response({
                    'success': True,
                    'lessonsRemaining': student.lessons_remaining,
                    'subscriptionBalance': student.subscription_balance,
                    'message': f'Lesson recorded successfully for {student.name}'
                })

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)

    @action(detail=False, methods=['post'], url_path='create-with-user')
    def create_with_user(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        response_serializer = StudentSerializer(student)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                # Extract data from request
                teacher = get_object_or_404(Teacher, id=request.data.get('teacher_id'))
                schedule_type = request.data.get('type')
                days = request.data.get('days', [])
                start_time = request.data.get('start_time')
                end_time = request.data.get('end_time')
                is_recurring = request.data.get('is_recurring', True)
                payment = request.data.get('payment', 0)

                # Create schedule based on type
                if schedule_type == 'private':
                    student = get_object_or_404(Student, id=request.data.get('student_id'))
                    schedule = ScheduleManager.create_schedule(
                        teacher=teacher,
                        start_time=start_time,
                        end_time=end_time,
                        days=days,
                        student=student,
                        payment=payment,
                        is_recurring=is_recurring
                    )
                else:  # group
                    group = get_object_or_404(Group, id=request.data.get('group_id'))
                    schedule = ScheduleManager.create_schedule(
                        teacher=teacher,
                        start_time=start_time,
                        end_time=end_time,
                        days=days,
                        group=group,
                        payment=payment,
                        is_recurring=is_recurring
                    )

                serializer = self.get_serializer(schedule)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Session.objects.all()
        
        try:
            # Get date parameter
            date = self.request.query_params.get('date', None)
            
            # Filter by date if provided
            if date:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(date=target_date)
                
                # Automatically set today's sessions to IN_PROGRESS
                today = timezone.now().date()
                if target_date == today:
                    queryset.filter(status='SCHEDULED').update(status='IN_PROGRESS')
            
            # Filter based on user role
            if hasattr(self.request.user, 'role'):
                if self.request.user.role == 'instructor':
                    # For teachers, show their sessions
                    teacher = Teacher.objects.get(user=self.request.user)
                    queryset = queryset.filter(teacher=teacher)
                    
                    # Generate sessions from schedule if none exist
                    if date and not queryset.exists():
                        weekday = target_date.weekday()
                        schedules = Schedule.objects.filter(
                            teacher=teacher,
                            days__contains=[weekday]
                        )
                        
                        for schedule in schedules:
                            session = schedule.generate_next_session(target_date=target_date)
                            if session:
                                queryset = queryset | Session.objects.filter(id=session.id)
                
                elif self.request.user.role == 'student':
                    # For students, show sessions they're part of
                    student = Student.objects.get(user=self.request.user)
                    queryset = queryset.filter(
                        Q(student=student) | Q(group__students=student)
                    )
            
            return queryset.select_related('student', 'group', 'teacher').distinct()
        
        except (Teacher.DoesNotExist, Student.DoesNotExist):
            return Session.objects.none()
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return Session.objects.none()

    @action(detail=True, methods=['post'])
    def toggle_activation(self, request, pk=None):
        session = self.get_object()
        if session.status == 'SCHEDULED':
            session.status = 'IN_PROGRESS'
        elif session.status == 'IN_PROGRESS':
            session.status = 'COMPLETED'
        session.save()
        return Response({'status': session.status})

    @action(detail=True, methods=['post'])
    def update_attendance(self, request, pk=None):
        session = self.get_object()
        student_id = request.data.get('studentId')
        
        try:
            student = Student.objects.get(id=student_id)
            attendance, created = AttendanceLog.objects.get_or_create(
                session=session,
                student=student,
                defaults={'status': 'present'}
            )
            
            if not created:
                attendance.status = 'present'
                attendance.save()
            
            return Response({
                'status': 'success',
                'message': f'Attendance updated for student {student.name}'
            })
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for a student in this session"""
        session = self.get_object()
        student_id = request.data.get('student_id')

        try:
            # Use the session's mark_attendance method which handles:
            # - Creating attendance log
            # - Deducting lessons
            # - Updating subscription balance
            attendance = session.mark_attendance(student_id)
            
            return Response({
                'message': 'Attendance marked successfully',
                'attendance': AttendanceLogSerializer(attendance).data
            }, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AttendanceLogViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceLogSerializer
    permission_classes = [IsAuthenticated]
    queryset = AttendanceLog.objects.all()

    def get_queryset(self):
        queryset = AttendanceLog.objects.all()
        
        try:
            # Filter by teacher if user is a teacher
            if hasattr(self.request.user, 'role') and self.request.user.role == 'instructor':
                teacher = Teacher.objects.get(user=self.request.user)
                queryset = queryset.filter(session__teacher=teacher)
            
            # Filter by date range
            start_date = self.request.query_params.get('start_date', None)
            end_date = self.request.query_params.get('end_date', None)
            
            if start_date and end_date:
                queryset = queryset.filter(session__date__range=[start_date, end_date])
            elif start_date:
                queryset = queryset.filter(session__date__gte=start_date)
            elif end_date:
                queryset = queryset.filter(session__date__lte=end_date)
            
            return queryset.select_related(
                'student',
                'session',
                'session__teacher'
            ).order_by('-session__date', 'student__name')
            
        except Teacher.DoesNotExist:
            return AttendanceLog.objects.none()
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return AttendanceLog.objects.none()

    def create(self, request, *args, **kwargs):
        try:
            # Get student and session from request data
            student_id = request.data.get('student')
            session_id = request.data.get('session')

            if not student_id or not session_id:
                return Response(
                    {'error': 'Both student and session are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get student and session objects
            student = Student.objects.get(id=student_id)
            session = Session.objects.get(id=session_id)

            # Check if session is active
            if session.status != 'IN_PROGRESS':
                return Response(
                    {'error': 'Session is not active'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if student has remaining lessons
            if student.lessons_remaining <= 0:
                return Response(
                    {'error': 'No remaining lessons in subscription'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if student has sufficient balance
            if student.subscription_balance <= 0:
                return Response(
                    {'error': 'Insufficient subscription balance'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for existing attendance today
            existing_attendance = AttendanceLog.objects.filter(
                student=student,
                session__date=session.date
            ).exists()

            if existing_attendance:
                return Response(
                    {'error': 'Attendance already marked for today'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create attendance log
            attendance = AttendanceLog.objects.create(
                student=student,
                session=session,
                status='present',
                valid=True
            )

            # Deduct one lesson and update subscription balance
            cost_per_lesson = student.subscription_balance / student.lessons_remaining
            student.lessons_remaining -= 1
            student.subscription_balance = F('subscription_balance') - cost_per_lesson
            student.save()

            # Refresh student to get updated values
            student.refresh_from_db()

            # Return success response
            response_data = self.get_serializer(attendance).data
            response_data.update({
                'lessons_remaining': student.lessons_remaining,
                'subscription_balance': float(student.subscription_balance)
            })

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Session.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error creating attendance log: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def update_status(self, request):
        try:
            print(f"Received update_status request: {request.data}")  # Debug log
            attendance_id = request.data.get('id')
            new_status = request.data.get('status')
            
            if not attendance_id or not new_status:
                return Response(
                    {'error': 'Both id and status are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            attendance = AttendanceLog.objects.select_related(
                'student', 'session'
            ).get(id=attendance_id)
            
            old_status = attendance.status
            print(f"Changing status from {old_status} to {new_status}")  # Debug log
            attendance.status = new_status
            
            # Handle lesson count and balance updates
            student = attendance.student
            
            if old_status == 'absent' and new_status == 'present':
                print(f"Deducting lesson. Current remaining: {student.lessons_remaining}")  # Debug log
                # Student was marked absent but is now present
                if student.lessons_remaining > 0:
                    # Calculate cost per lesson based on current balance and remaining lessons
                    cost_per_lesson = student.subscription_balance / student.lessons_remaining
                    print(f"Cost per lesson: {cost_per_lesson}")  # Debug log
                    
                    # Deduct one lesson and update balance
                    student.lessons_remaining -= 1
                    student.subscription_balance -= cost_per_lesson
                    print(f"New balance: {student.subscription_balance}")  # Debug log
                else:
                    return Response(
                        {'error': 'No remaining lessons available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            elif old_status == 'present' and new_status == 'absent':
                print(f"Adding lesson back. Current remaining: {student.lessons_remaining}")  # Debug log
                # Calculate cost per lesson based on current balance and remaining lessons
                # We need to include the lesson we're adding back in the calculation
                total_lessons = student.lessons_remaining + 1
                cost_per_lesson = student.subscription_balance / student.lessons_remaining if student.lessons_remaining > 0 else 0
                
                # Add back one lesson and update balance
                student.lessons_remaining += 1
                student.subscription_balance += cost_per_lesson
                print(f"New balance: {student.subscription_balance}")  # Debug log
            
            # Save changes
            student.save()
            attendance.save()
            print(f"Changes saved. New lessons remaining: {student.lessons_remaining}")  # Debug log
            
            # Return updated attendance and student data
            response_data = self.get_serializer(attendance).data
            response_data.update({
                'lessons_remaining': student.lessons_remaining,
                'subscription_balance': float(student.subscription_balance)
            })
            
            return Response(response_data)
            
        except AttendanceLog.DoesNotExist:
            return Response(
                {'error': 'Attendance record not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in update_status: {str(e)}")  # Debug log
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Performance.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        return queryset


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]


class StudentSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = StudentSubscription.objects.all()
    serializer_class = StudentSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudentSubscription.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        return queryset


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_qr_code(request, student_id):
    try:
        # Get QR code data from request
        qr_data = request.data.get('qr_code')
        if not qr_data:
            return Response({
                'success': False,
                'message': 'QR code data is required'
            }, status=400)

        # Direct comparison of student_id with QR code data
        if str(student_id) != qr_data:
            return Response({
                'success': False,
                'message': 'Invalid QR code'
            }, status=400)

        student = Student.objects.get(id=student_id)

        # Check if student has remaining lessons
        if student.lessons_remaining <= 0:
            return Response({
                'success': False,
                'message': 'No remaining lessons in subscription'
            }, status=400)

        # Check if student has sufficient balance
        if student.subscription_balance <= 0:
            return Response({
                'success': False,
                'message': 'Insufficient subscription balance'
            }, status=400)

        # Check for existing attendance today
        today = timezone.now().date()
        existing_attendance = AttendanceLog.objects.filter(
            student=student,
            scanned_at__date=today
        ).exists()

        if existing_attendance:
            return Response({
                'success': False,
                'message': 'Attendance already marked for today'
            }, status=400)

        # Get or create today's session
        session, created = Session.objects.get_or_create(
            date=today,
            defaults={
                'language': student.level.split('_')[0] if '_' in student.level else 'English',
                'level': student.level.split('_')[1] if '_' in student.level else student.level,
                'status': 'IN_PROGRESS'  # Set status to IN_PROGRESS by default
            }
        )

        # If session exists but not in progress, set it to in progress
        if not created and session.status != 'IN_PROGRESS':
            session.status = 'IN_PROGRESS'
            session.save()

        # Mark attendance using the session's method
        attendance = session.mark_attendance(student.id)

        return Response({
            'success': True,
            'lessonsRemaining': student.lessons_remaining,
            'subscriptionBalance': student.subscription_balance,
            'message': f'Attendance marked successfully for {student.name}'
        })

    except Student.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Student not found'
        }, status=404)
    except Exception as e:
        print(f"Error in scan_qr_code: {str(e)}")
        return Response({
            'success': False,
            'message': str(e)
        }, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_attendance(request):
    try:
        # Get the 10 most recent attendance records
        recent_records = AttendanceLog.objects.select_related(
            'student', 'session'
        ).filter(
            valid=True
        ).order_by('-scanned_at')[:10]

        attendance_data = []
        for record in recent_records:
            attendance_data.append({
                'student': {
                    'id': record.student.id,
                    'name': record.student.name,
                    'email': record.student.email,
                    'qr_code': record.student.qr_code
                },
                'scanned_at': record.scanned_at.isoformat(),
                'session': {
                    'language': record.session.language,
                    'level': record.session.level
                }
            })

        return Response(attendance_data)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        today = timezone.now().date()

        # Get upcoming sessions
        upcoming_sessions = Session.objects.filter(
            date__gte=today
        ).order_by('date')[:5]

        # Calculate attendance rate
        total_sessions = AttendanceLog.objects.filter(student=student).count()
        attended_sessions = AttendanceLog.objects.filter(
            student=student,
            valid=True
        ).count()
        attendance_rate = (attended_sessions / total_sessions * 100) if total_sessions > 0 else 0

        # Get recent performance
        recent_performance = Performance.objects.filter(
            student=student
        ).order_by('-date')[:3]

        # Calculate average score
        avg_score = Performance.objects.filter(student=student).aggregate(
            avg=Avg(
                (F('vocabulary_score') + F('grammar_score') +
                 F('speaking_score') + F('listening_score')) / 4
            )
        )['avg'] or 0

        return Response({
            'lessonsRemaining': student.lessons_remaining,
            'attendanceRate': round(attendance_rate, 1),
            'averageScore': round(avg_score, 1),
            'upcomingSessions': SessionSerializer(upcoming_sessions, many=True).data,
            'recentPerformance': PerformanceSerializer(recent_performance, many=True).data,
        })


class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)

            # Check if student has remaining lessons
            if student.lessons_remaining <= 0:
                return Response({
                    'success': False,
                    'message': 'No remaining lessons in subscription'
                }, status=400)

            # Check for existing attendance today
            today = timezone.now().date()
            existing_attendance = AttendanceLog.objects.filter(
                student=student,
                scanned_at__date=today
            ).exists()

            if existing_attendance:
                return Response({
                    'success': False,
                    'message': 'Attendance already marked for today'
                }, status=400)

            # Find an active session for today
            try:
                session = Session.objects.get(
                    date=today,
                    manually_activated=True,
                    student=student
                )
            except Session.DoesNotExist:
                try:
                    session = Session.objects.get(
                        date=today,
                        manually_activated=True,
                        group__students__student=student
                    )
                except Session.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'No active session found for today. Please ensure a session is activated before scanning.'
                    }, status=400)

            # Mark attendance using the session's method
            attendance = session.mark_attendance(student.id)

            return Response({
                'success': True,
                'lessonsRemaining': student.lessons_remaining,
                'message': f'Attendance marked successfully for {student.name}'
            })

        except Student.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Student not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_qr_code(request, student_id):
    """
    QR code refreshing temporarily disabled
    Will be re-implemented with enhanced security features
    """
    return Response({
        'success': False,
        'message': 'QR code refreshing is temporarily disabled'
    }, status=400)

    # try:
    #     # First try to get student by their user
    #     if request.user.role == 'student':
    #         student = Student.objects.get(user=request.user)
    #     else:
    #         # For admin users, allow them to refresh any student's QR code
    #         student = Student.objects.get(id=student_id)

    #     # Generate new QR code
    #     qr_code = student.generate_qr_code()

    #     return Response({
    #         'success': True,
    #         'qr_code': qr_code
    #     })
    # except Student.DoesNotExist:
    #     return Response({
    #         'success': False,
    #         'message': 'Student not found'
    #     }, status=404)
    # except Exception as e:
    #     print(f"Error in refresh_qr_code: {str(e)}")  # Debug log
    #     return Response({
    #         'success': False,
    #         'message': str(e)
    #     }, status=500)
