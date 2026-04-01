# Generated manually to enforce Client -> ProjectTitle -> Product hierarchy

import django.db.models.deletion
from django.db import migrations, models


def forward_backfill_project_titles_and_service_others(apps, schema_editor):
    Client = apps.get_model('tickets', 'Client')
    Product = apps.get_model('tickets', 'Product')
    ProjectTitle = apps.get_model('tickets', 'ProjectTitle')
    Ticket = apps.get_model('tickets', 'Ticket')

    unknown_client, _ = Client.objects.get_or_create(
        client_name='Unknown Client',
        defaults={
            'contact_person': '',
            'landline': '',
            'mobile_no': '',
            'designation': '',
            'department_organization': '',
            'email_address': '',
            'address': '',
            'is_active': True,
        },
    )

    # Ensure every product has a project title and therefore an owning client.
    for product in Product.objects.filter(project_title__isnull=True).select_related('client'):
        client = product.client or unknown_client
        project_title, _ = ProjectTitle.objects.get_or_create(
            client=client,
            name='General',
            defaults={
                'description': 'Auto-generated during hierarchy migration',
                'is_active': True,
            },
        )
        product.project_title = project_title
        # Keep legacy client column aligned.
        product.client = client
        product.save(update_fields=['project_title', 'client'])

    # Move any existing ticket-level "others" value to the linked type of service.
    for ticket in Ticket.objects.exclude(type_of_service__isnull=True):
        tos = ticket.type_of_service
        ticket_other = (getattr(ticket, 'type_of_service_others', '') or '').strip()
        if ticket_other and not (tos.type_of_service_others or '').strip():
            tos.type_of_service_others = ticket_other
            tos.save(update_fields=['type_of_service_others'])


def reverse_noop(apps, schema_editor):
    # Data migration is intentionally not reversed.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0036_remove_ticket_brand_remove_ticket_date_purchased_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectTitle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=300)),
                ('description', models.TextField(blank=True, default='')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(help_text='Client that owns this project title', on_delete=django.db.models.deletion.CASCADE, related_name='project_titles', to='tickets.client')),
            ],
            options={
                'ordering': ['client__client_name', 'name'],
                'unique_together': {('client', 'name')},
            },
        ),
        migrations.AddField(
            model_name='typeofservice',
            name='type_of_service_others',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='project_title',
            field=models.ForeignKey(blank=True, help_text='Project title this product belongs to', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='products', to='tickets.projecttitle'),
        ),
        migrations.RunPython(forward_backfill_project_titles_and_service_others, reverse_noop),
        migrations.AlterField(
            model_name='product',
            name='project_title',
            field=models.ForeignKey(help_text='Project title this product belongs to', on_delete=django.db.models.deletion.PROTECT, related_name='products', to='tickets.projecttitle'),
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='type_of_service_others',
        ),
    ]
