from rest_framework import viewsets, views, response, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from ..models.config import RetentionPolicy, Announcement, ReportSettings
from ..serializers.config import RetentionPolicySerializer, AnnouncementSerializer, ReportSettingsSerializer
from ..permissions import IsSuperAdmin


class RetentionPolicyViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def list(self, request):
        policy = RetentionPolicy.get_policy()
        serializer = RetentionPolicySerializer(policy)
        return response.Response(serializer.data)

    def update(self, request, pk=None):
        policy = RetentionPolicy.get_policy()
        serializer = RetentionPolicySerializer(policy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSuperAdmin()]
        return [IsAuthenticated(), IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReportSettingsView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        settings = ReportSettings.get_settings()
        serializer = ReportSettingsSerializer(settings)
        return response.Response(serializer.data)

    def put(self, request):
        settings = ReportSettings.get_settings()
        serializer = ReportSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
