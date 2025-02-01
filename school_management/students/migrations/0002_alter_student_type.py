from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='student_type',
            field=models.CharField(max_length=10, null=True, blank=True),
        ),
    ] 