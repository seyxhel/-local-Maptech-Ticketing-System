from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='failed_login_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='is_login_blocked',
            field=models.BooleanField(default=False),
        ),
    ]
