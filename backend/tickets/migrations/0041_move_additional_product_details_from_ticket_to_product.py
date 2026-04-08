from django.db import migrations, models


def copy_ticket_details_to_product(apps, schema_editor):
    Ticket = apps.get_model('tickets', 'Ticket')
    Product = apps.get_model('tickets', 'Product')

    fields = [
        'client_purchase_no',
        'maptech_dr',
        'maptech_sales_invoice',
        'maptech_sales_order_no',
        'supplier_purchase_no',
        'supplier_sales_invoice',
        'supplier_delivery_receipt',
    ]

    for ticket in Ticket.objects.select_related('product_record').all():
        product = getattr(ticket, 'product_record', None)
        if not product:
            continue

        update_fields = []
        for field in fields:
            ticket_val = getattr(ticket, field, '') or ''
            product_val = getattr(product, field, '') or ''
            if ticket_val and ticket_val != product_val:
                setattr(product, field, ticket_val)
                update_fields.append(field)

        if update_fields:
            product.save(update_fields=update_fields)


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0040_ticket_add_additional_product_detail_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='client_purchase_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='maptech_dr',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='maptech_sales_invoice',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='maptech_sales_order_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='supplier_purchase_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='supplier_sales_invoice',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='product',
            name='supplier_delivery_receipt',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.RunPython(copy_ticket_details_to_product, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='ticket',
            name='client_purchase_no',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='maptech_dr',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='maptech_sales_invoice',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='maptech_sales_order_no',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='supplier_purchase_no',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='supplier_sales_invoice',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='supplier_delivery_receipt',
        ),
    ]
