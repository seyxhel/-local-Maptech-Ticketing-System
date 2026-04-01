import django.db.models.deletion
from django.db import migrations, models


def forward_copy_project_title_and_require_client(apps, schema_editor):
    Client = apps.get_model('tickets', 'Client')
    Product = apps.get_model('tickets', 'Product')
    ProjectTitle = apps.get_model('tickets', 'ProjectTitle')

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

    for product in Product.objects.all():
        title_name = 'General'
        if product.project_title_id:
            pt = ProjectTitle.objects.filter(id=product.project_title_id).only('name').first()
            if pt and pt.name:
                title_name = pt.name

        if not product.client_id:
            product.client = unknown_client

        product.project_title_text = title_name
        product.save(update_fields=['client', 'project_title_text'])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0038_alter_product_client_legacy_helptext'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='project_title_text',
            field=models.CharField(blank=True, default='', max_length=300),
        ),
        migrations.RunPython(forward_copy_project_title_and_require_client, reverse_noop),
        migrations.RemoveField(
            model_name='product',
            name='project_title',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='project_title_text',
            new_name='project_title',
        ),
        migrations.AlterField(
            model_name='product',
            name='client',
            field=models.ForeignKey(help_text='Client that owns this product', on_delete=django.db.models.deletion.PROTECT, related_name='products', to='tickets.client'),
        ),
        migrations.AlterField(
            model_name='product',
            name='project_title',
            field=models.CharField(help_text='Project title this product belongs to', max_length=300),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.CheckConstraint(condition=~models.Q(project_title=''), name='product_project_title_not_blank'),
        ),
        migrations.DeleteModel(
            name='ProjectTitle',
        ),
    ]
