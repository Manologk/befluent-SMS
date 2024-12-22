from django.shortcuts import render
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
from django.db.models import Avg, F
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction

from django.core.exceptions import ValidationError


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

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


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            teacher_id = request.data.get('teacher_id')
            teacher = Teacher.objects.get(id=teacher_id)

            schedule_data = {
                'start_time': request.data.get('start_time'),
                'end_time': request.data.get('end_time'),
                'day': request.data.get('day')
            }

            if 'group_id' in request.data:
                group = Group.objects.get(id=request.data['group_id'])
                schedule = ClassManagementService.assign_teacher_to_group(
                    teacher, group, schedule_data
                )
            else:
                student = Student.objects.get(id=request.data['student_id'])
                schedule = ClassManagementService.assign_private_teacher(
                    teacher, student, schedule_data
                )

            serializer = self.get_serializer(schedule)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except (ValidationError, Teacher.DoesNotExist,
                Group.DoesNotExist, Student.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]


class AttendanceLogViewSet(viewsets.ModelViewSet):
    queryset = AttendanceLog.objects.all()
    serializer_class = AttendanceLogSerializer
    permission_classes = [IsAuthenticated]


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
        student.lessons_remaining -= 1
        student.subscription_balance = F('subscription_balance') - 1  # Deduct 1 unit from balance
        student.save()

        # Refresh to get updated values
        student.refresh_from_db()

        # Send notification if lessons are running low
        # if student.lessons_remaining <= 3:
        #     # TODO: Implement notification system
        #     pass

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
        return Response({
            'success': False,
            'message': str(e)
        }, status=500)


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

            # Get or create today's session
            session, _ = Session.objects.get_or_create(
                date=today,
                defaults={
                    'language': 'English',  # This should be dynamic based on student's enrollment
                    'level': 'Intermediate'  # This should be dynamic
                }
            )

            # Create attendance log
            AttendanceLog.objects.create(
                student=student,
                session=session,
                valid=True
            )

            # Deduct one lesson
            student.lessons_remaining -= 1
            student.save()

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
