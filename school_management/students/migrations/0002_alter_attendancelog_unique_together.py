# Generated by Django 5.0.6 on 2025-02-08 09:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='attendancelog',
            unique_together={('student', 'session')},
        ),
    ]
