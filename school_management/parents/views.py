from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import Parent, ParentStudentLink
from .serializers import ParentSerializer, ParentStudentLinkSerializer, ParentAuthSerializer, ParentProfileSerializer
from students.models import Student, Performance
from students.serializers import StudentSerializer, PerformanceSerializer
from django.db.models import Sum, F

# Create your views here.

class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'login':
            return ParentAuthSerializer
        if self.action in ['me', 'retrieve']:
            return ParentProfileSerializer
        return ParentSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            parent = Parent.objects.get(user=user)
        except Parent.DoesNotExist:
            return Response(
                {'error': 'User is not a parent'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'parent': ParentProfileSerializer(parent).data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        try:
            parent = Parent.objects.get(user=request.user)
        except Parent.DoesNotExist:
            return Response(
                {'error': 'User is not a parent'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(parent)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def children_performance(self, request):
        parent = Parent.objects.get(user=request.user)
        links = ParentStudentLink.objects.filter(parent=parent)
        students = [link.student for link in links]
        
        performances = Performance.objects.filter(student__in=students)
        serializer = PerformanceSerializer(performances, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return Parent.objects.all().prefetch_related(
            'parentstudentlink_set__student'
        ).annotate(
            total_lessons=Sum('parentstudentlink__student__lessons_remaining'),
            total_balance=Sum('parentstudentlink__student__subscription_balance')
        )

    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        parent = self.get_object()
        links = ParentStudentLink.objects.filter(parent=parent)
        children = [link.student for link in links]
        serializer = StudentBasicSerializer(children, many=True)
        return Response(serializer.data)

class ParentStudentLinkViewSet(viewsets.ModelViewSet):
    queryset = ParentStudentLink.objects.all()
    serializer_class = ParentStudentLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ParentStudentLink.objects.all()
        parent_id = self.request.query_params.get('parent_id', None)
        if parent_id is not None:
            queryset = queryset.filter(parent_id=parent_id)
        return queryset
