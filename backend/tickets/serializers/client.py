from rest_framework import serializers
from ..models import Client
from tickets.input_security import sanitize_payload


class ClientSerializer(serializers.ModelSerializer):
    sales_representative = serializers.CharField(allow_blank=True, required=False)
    additional_sales_reps = serializers.ListField(child=serializers.CharField(), required=False)

    text_field_rules = {
        'client_name': {'max_length': 200},
        'contact_person': {'max_length': 200},
        'landline': {'max_length': 30},
        'mobile_no': {'max_length': 20},
        'designation': {'max_length': 200},
        'department_organization': {'max_length': 200},
        'email_address': {'max_length': 254},
        'address': {'max_length': None, 'allow_newlines': True},
        'sales_representative': {'max_length': 200},
        'additional_sales_reps': {'max_length': 200},
    }

    class Meta:
        model = Client
        fields = [
            'id', 'client_name', 'contact_person', 'landline', 'mobile_no',
            'designation', 'department_organization', 'email_address', 'address',
            'is_active', 'created_at', 'updated_at', 'sales_representative', 'additional_sales_reps',
        ]

    def to_internal_value(self, data):
        return super().to_internal_value(sanitize_payload(data, self.text_field_rules))
