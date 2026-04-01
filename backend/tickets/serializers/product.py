from rest_framework import serializers
from ..models import Product
from .lookup import CategorySerializer
from .client import ClientSerializer


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    client_detail = ClientSerializer(source='client', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_detail',
            'project_title', 'client', 'client_detail',
            'device_equipment', 'version_no',
            'serial_no', 'has_warranty', 'product_name', 'brand',
            'model_name', 'sales_no', 'date_purchased', 'is_active', 'created_at', 'updated_at',
        ]
