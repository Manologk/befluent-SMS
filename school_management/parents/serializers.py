from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Parent, ParentStudentLink
from students.serializers import StudentSerializer
from students.models import Student

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

    class Meta:
        model = Parent
        fields = [
            'id', 
            'name', 
            'email', 
            'phone_number', 
            'children',
            'total_lessons_remaining',
            'total_subscription_balance'
        ]

class ParentStudentLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentStudentLink
        fields = '__all__'
