from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0039_convert_project_title_to_product_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='client_purchase_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='maptech_dr',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='maptech_sales_invoice',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='maptech_sales_order_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='supplier_purchase_no',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='supplier_sales_invoice',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='ticket',
            name='supplier_delivery_receipt',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
    ]
