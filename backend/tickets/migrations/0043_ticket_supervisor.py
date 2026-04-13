from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0042_feedbackrating_delete_csatfeedback'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='supervisor',
            field=models.ForeignKey(
                blank=True,
                help_text='Supervisor assigned by sales for call/priority review and technical assignment',
                null=True,
                on_delete=models.SET_NULL,
                related_name='supervised_tickets',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
