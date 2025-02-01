from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('students', '0002_alter_student_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='student',
            name='student_type',
        ),
    ] 