from rest_framework import viewsets, status
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from ..models import CallLog, FeedbackRating
from ..serializers import CallLogSerializer, FeedbackRatingSerializer
from ..permissions import IsAdminLevel, IsSupervisorLevel


class CallLogViewSet(viewsets.ModelViewSet):
    """CRUD for call logs. Admin creates, all admin-level can list."""
    queryset = CallLog.objects.all().order_by('-call_start')
    serializer_class = CallLogSerializer
    permission_classes = [IsAuthenticated, IsSupervisorLevel]
    swagger_tags = ['Call Logs']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CallLog.objects.none()
        qs = CallLog.objects.all().order_by('-call_start')

        ticket_id = self.request.query_params.get('ticket')
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(client_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(notes__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

    @action(detail=True, methods=['post'])
    def end_call(self, request, pk=None):
        """End an active call (sets call_end to now)."""
        call_log = self.get_object()
        if call_log.call_end:
            return Response({'detail': 'Call already ended.'}, status=status.HTTP_400_BAD_REQUEST)
        call_log.call_end = timezone.now()
        notes = request.data.get('notes')
        if notes:
            call_log.notes = notes
        call_log.save()
        return Response(CallLogSerializer(call_log).data)


class FeedbackRatingViewSet(viewsets.ModelViewSet):
    """Admin submits feedback ratings on employee performance before closing a ticket."""
    queryset = FeedbackRating.objects.all().order_by('-created_at')
    serializer_class = FeedbackRatingSerializer
    permission_classes = [IsAuthenticated, IsAdminLevel]
    swagger_tags = ['Feedback Ratings']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return FeedbackRating.objects.none()
        qs = FeedbackRating.objects.all().order_by('-created_at')

        ticket_id = self.request.query_params.get('ticket')
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)

        employee_id = self.request.query_params.get('employee')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)
