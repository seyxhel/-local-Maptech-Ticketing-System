"""
Management command to delete audit logs and call logs older than
the configured retention period.

Usage:
    python manage.py cleanup_old_logs          # actually delete
    python manage.py cleanup_old_logs --dry-run  # preview only
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from tickets.models import AuditLog, CallLog, RetentionPolicy


class Command(BaseCommand):
    help = 'Delete audit logs and call logs older than the configured retention period.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show how many records would be deleted without actually deleting them.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        policy = RetentionPolicy.get_policy()
        now = timezone.now()

        # Audit logs
        if policy.audit_log_retention_days > 0:
            cutoff = now - timedelta(days=policy.audit_log_retention_days)
            audit_qs = AuditLog.objects.filter(timestamp__lt=cutoff)
            count = audit_qs.count()
            if dry_run:
                self.stdout.write(f'[DRY RUN] Would delete {count} audit log(s) older than {cutoff.date()}.')
            else:
                deleted, _ = audit_qs.delete()
                self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} audit log(s) older than {cutoff.date()}.'))
        else:
            self.stdout.write('Audit log retention: keep forever (0 days). Skipping.')

        # Call logs
        if policy.call_log_retention_days > 0:
            cutoff = now - timedelta(days=policy.call_log_retention_days)
            call_qs = CallLog.objects.filter(created_at__lt=cutoff)
            count = call_qs.count()
            if dry_run:
                self.stdout.write(f'[DRY RUN] Would delete {count} call log(s) older than {cutoff.date()}.')
            else:
                deleted, _ = call_qs.delete()
                self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} call log(s) older than {cutoff.date()}.'))
        else:
            self.stdout.write('Call log retention: keep forever (0 days). Skipping.')
