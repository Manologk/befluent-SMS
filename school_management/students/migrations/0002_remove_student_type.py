from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql='''
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'students_student'
                    AND column_name = 'student_type'
                ) THEN
                    ALTER TABLE students_student DROP COLUMN student_type;
                END IF;
            END $$;
            ''',
            reverse_sql='''
            -- No reverse migration needed as we're removing a field that shouldn't exist
            '''
        ),
    ] 