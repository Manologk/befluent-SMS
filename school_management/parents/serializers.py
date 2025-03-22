from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Parent, ParentStudentLink
from students.serializers import StudentSerializer
from students.models import Student
from django.db import transaction

User = get_user_model()

class ParentAuthSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ParentProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Parent
        fields = ['id', 'user', 'phone_number', 'children']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name
        }

    def get_children(self, obj):
        links = ParentStudentLink.objects.filter(parent=obj)
        return StudentSerializer([link.student for link in links], many=True).data

class StudentBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'level', 'lessons_remaining', 'subscription_balance']

class ParentSerializer(serializers.ModelSerializer):
    children = StudentBasicSerializer(many=True, read_only=True)
    total_lessons_remaining = serializers.IntegerField(read_only=True)
    total_subscription_balance = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Parent
        fields = [
            'id', 
            'name', 
            'email', 
            'phone_number', 
            'password',
            'children',
            'total_lessons_remaining',
            'total_subscription_balance'
        ]

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        name = validated_data.get('name')
        
        # Create User instance using the custom User model
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=name,
            role='parent'  # Set the role to parent
        )
        
        # Create Parent instance
        parent = Parent.objects.create(
            user=user,
            **validated_data
        )
        
        return parent

class ParentStudentLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentStudentLink
        fields = '__all__'
