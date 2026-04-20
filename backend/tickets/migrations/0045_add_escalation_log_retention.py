# Generated migration for adding escalation_log_retention_days to RetentionPolicy

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0044_alter_announcement_visibility'),
    ]

    operations = [
        migrations.AddField(
            model_name='retentionpolicy',
            name='escalation_log_retention_days',
            field=models.PositiveIntegerField(
                default=365,
                help_text='Number of days to retain escalation logs. 0 means keep forever.',
            ),
        ),
    ]
