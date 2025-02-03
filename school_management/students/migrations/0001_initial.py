# Generated by Django 5.0.6 on 2025-02-03 17:51

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('language', models.CharField(choices=[('English', 'English'), ('Spanish', 'Spanish'), ('French', 'French'), ('German', 'German'), ('Italian', 'Italian'), ('Portuguese', 'Portuguese'), ('Russian', 'Russian'), ('Chinese', 'Chinese'), ('Japanese', 'Japanese'), ('Korean', 'Korean')], max_length=50)),
                ('level', models.CharField(choices=[('Beginner', 'Beginner'), ('Elementary', 'Elementary'), ('Intermediate', 'Intermediate'), ('Upper Intermediate', 'Upper Intermediate'), ('Advanced', 'Advanced'), ('Proficient', 'Proficient')], max_length=50)),
                ('max_capacity', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive'), ('full', 'Full'), ('archived', 'Archived')], default='active', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='SubscriptionPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('number_of_lessons', models.IntegerField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('days', models.JSONField(default=list, help_text='List of weekday numbers (0-6, Monday is 0)')),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('is_recurring', models.BooleanField(default=True)),
                ('payment', models.DecimalField(decimal_places=2, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.group')),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('subscription_balance', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('lessons_remaining', models.IntegerField(default=0)),
                ('qr_code', models.TextField(blank=True)),
                ('phone_number', models.CharField(blank=True, max_length=20)),
                ('level', models.CharField(blank=True, max_length=50)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='student', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('type', models.CharField(choices=[('GROUP', 'Group'), ('PRIVATE', 'Private')], max_length=10)),
                ('payment', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('SCHEDULED', 'Scheduled'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='IN_PROGRESS', max_length=20)),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.group')),
                ('schedule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to='students.schedule')),
                ('student', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.student')),
            ],
        ),
        migrations.AddField(
            model_name='schedule',
            name='student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.student'),
        ),
        migrations.CreateModel(
            name='Performance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('vocabulary_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('grammar_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('speaking_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('listening_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('comments', models.TextField(blank=True, null=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.session')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.student')),
            ],
        ),
        migrations.CreateModel(
            name='AttendanceLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scanned_at', models.DateTimeField(auto_now_add=True)),
                ('valid', models.BooleanField(default=True)),
                ('status', models.CharField(choices=[('present', 'Present'), ('absent', 'Absent'), ('late', 'Late')], default='absent', max_length=20)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.session')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.student')),
            ],
        ),
        migrations.CreateModel(
            name='StudentSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.student')),
                ('subscription_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.subscriptionplan')),
            ],
        ),
        migrations.CreateModel(
            name='Teacher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone_number', models.CharField(blank=True, max_length=20)),
                ('specializations', models.JSONField(default=list)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='teacher', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='session',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.teacher'),
        ),
        migrations.AddField(
            model_name='schedule',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.teacher'),
        ),
        migrations.AddField(
            model_name='group',
            name='teacher',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='teaching_groups', to='students.teacher'),
        ),
        migrations.CreateModel(
            name='GroupStudent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_date', models.DateTimeField(auto_now_add=True)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='students', to='students.group')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.student')),
            ],
            options={
                'unique_together': {('student', 'group')},
            },
        ),
    ]
