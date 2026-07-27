from rest_framework import serializers
from ..models.config import RetentionPolicy, Announcement, ReportSettings


class RetentionPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = RetentionPolicy
        fields = '__all__'
        read_only_fields = ('updated_at', 'updated_by')


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')


class ReportSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSettings
        fields = '__all__'
        read_only_fields = ('updated_at', 'updated_by')
