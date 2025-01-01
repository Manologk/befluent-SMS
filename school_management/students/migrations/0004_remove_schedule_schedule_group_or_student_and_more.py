# Generated by Django 5.1.3 on 2024-12-28 11:51

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0003_remove_session_session_type_constraint_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='schedule',
            name='schedule_group_or_student',
        ),
        migrations.RemoveConstraint(
            model_name='session',
            name='session_type_constraint',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='session',
            name='is_online',
        ),
        migrations.RemoveField(
            model_name='session',
            name='language',
        ),
        migrations.RemoveField(
            model_name='session',
            name='level',
        ),
        migrations.RemoveField(
            model_name='session',
            name='manually_activated',
        ),
        migrations.RemoveField(
            model_name='session',
            name='topic',
        ),
        migrations.AddField(
            model_name='session',
            name='payment',
            field=models.DecimalField(decimal_places=2, default=1, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='session',
            name='schedule',
            field=models.ForeignKey(default=200, on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to='students.schedule'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='session',
            name='status',
            field=models.CharField(choices=[('SCHEDULED', 'Scheduled'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='SCHEDULED', max_length=20),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='day',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='payment',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='session',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.group'),
        ),
        migrations.AlterField(
            model_name='session',
            name='student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='students.student'),
        ),
        migrations.AlterField(
            model_name='session',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='students.teacher'),
        ),
        migrations.AlterField(
            model_name='session',
            name='type',
            field=models.CharField(choices=[('GROUP', 'Group'), ('PRIVATE', 'Private')], max_length=10),
        ),
    ]
