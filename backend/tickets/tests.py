from types import SimpleNamespace

from django.test import TestCase, SimpleTestCase

from users.models import User
from users.serializers import AdminUserCreateSerializer

from .input_security import clean_text
from .serializers.client import ClientSerializer


class InputSecurityTests(SimpleTestCase):
    def test_clean_text_strips_tags_and_control_chars(self):
        value = '<script>alert(1)</script>\nHello\x00 world'

        cleaned = clean_text(value)

        self.assertEqual(cleaned, 'alert(1) Hello world')


class SerializerSanitizationTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='password123',
            role=User.ROLE_ADMIN,
        )

    def test_admin_user_create_serializer_normalizes_profile_input(self):
        serializer = AdminUserCreateSerializer(
            data={
                'first_name': ' <b>John</b> ',
                'middle_name': ' <i>Q</i> ',
                'last_name': ' Doe<script>alert(1)</script> ',
                'suffix': ' Jr. ',
                'email': '  USER@Example.com  ',
                'phone': ' +63 912 345 6789 ',
                'role': 'employee',
            },
            context={'request': SimpleNamespace(user=self.admin)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['first_name'], 'John')
        self.assertEqual(serializer.validated_data['middle_name'], 'Q')
        self.assertEqual(serializer.validated_data['last_name'], 'Doealert(1)')
        self.assertEqual(serializer.validated_data['suffix'], 'Jr.')
        self.assertEqual(serializer.validated_data['email'], 'user@example.com')
        self.assertEqual(serializer.validated_data['phone'], '+63 912 345 6789')

    def test_client_serializer_cleans_list_and_text_fields(self):
        serializer = ClientSerializer(
            data={
                'client_name': ' <b>Acme Corp</b> ',
                'additional_sales_reps': [' <i>Alice</i> ', 'Bob<script>'],
                'email_address': 'sales@example.com',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['client_name'], 'Acme Corp')
        self.assertEqual(serializer.validated_data['additional_sales_reps'], ['Alice', 'Bob'])
