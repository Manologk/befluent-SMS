from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models import Sum


# Create your models here.
class Parent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)

    def __str__(self):
        return self.name

    @property
    def total_lessons_remaining(self):
        return self.parentstudentlink_set.aggregate(
            total=Sum('student__lessons_remaining')
        )['total'] or 0

    @property
    def total_subscription_balance(self):
        return self.parentstudentlink_set.aggregate(
            total=Sum('student__subscription_balance')
        )['total'] or 0

    @property
    def children(self):
        return [link.student for link in self.parentstudentlink_set.all()]


class ParentStudentLink(models.Model):
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.parent.name} -> {self.student.name}"
