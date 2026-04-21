from django.utils import timezone
from rest_framework import serializers
from ..models import RetentionPolicy, Announcement
from tickets.input_security import sanitize_payload


class RetentionPolicySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = RetentionPolicy
        fields = [
            'id', 'audit_log_retention_days', 'call_log_retention_days',
            'escalation_log_retention_days', 'updated_at', 'updated_by', 'updated_by_name',
        ]
        read_only_fields = ['id', 'updated_at', 'updated_by', 'updated_by_name']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            name = obj.updated_by.get_full_name()
            return name if name.strip() else obj.updated_by.username
        return None


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    is_currently_active = serializers.BooleanField(read_only=True)

    text_field_rules = {
        'title': {'max_length': 255},
        'description': {'max_length': None, 'allow_newlines': True},
    }

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'description', 'announcement_type', 'visibility',
            'is_active', 'start_date', 'end_date',
            'created_by', 'created_by_name', 'is_currently_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'is_currently_active', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        return super().to_internal_value(sanitize_payload(data, self.text_field_rules))

    def get_created_by_name(self, obj):
        if obj.created_by:
            name = obj.created_by.get_full_name()
            return name if name.strip() else obj.created_by.username
        return None

    def validate_start_date(self, value):
        now = timezone.now()
        if value.date() < now.date():
            current_start = getattr(self.instance, 'start_date', None)
            if self.instance is None or not current_start or current_start.date() >= now.date():
                raise serializers.ValidationError('Start date cannot be in the past.')
        return value
