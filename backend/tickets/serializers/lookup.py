from rest_framework import serializers
from ..models import TypeOfService, Category
from tickets.input_security import sanitize_payload


class TypeOfServiceSerializer(serializers.ModelSerializer):
    text_field_rules = {
        'name': {'max_length': 200},
        'type_of_service_others': {'max_length': 200},
        'description': {'max_length': None, 'allow_newlines': True},
    }

    class Meta:
        model = TypeOfService
        fields = ['id', 'name', 'type_of_service_others', 'description', 'is_active', 'estimated_resolution_days']

    def to_internal_value(self, data):
        return super().to_internal_value(sanitize_payload(data, self.text_field_rules))


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    text_field_rules = {
        'name': {'max_length': 200},
        'description': {'max_length': None, 'allow_newlines': True},
    }

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active', 'product_count', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        return super().to_internal_value(sanitize_payload(data, self.text_field_rules))

    def get_product_count(self, obj):
        return obj.products.count()
