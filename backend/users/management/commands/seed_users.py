from django.core.management.base import BaseCommand
from users.models import User


SEED_USERS = [
    {
        'username': 'seyxhel',
        'first_name': 'Sealtiel Joseph',
        'last_name': 'Pelagio',
        'email': 'sethpelagio20@gmail.com',
        'password': 'Oklangyan421!',
        'phone': '+639692221370',
        'role': User.ROLE_SUPERADMIN,
        'is_staff': True,       # superadmin: is_staff=True, is_superuser=True
        'is_superuser': True,
    },
    {
        'username': 'gerardcuadra',
        'first_name': 'Gerard',
        'last_name': 'Cuadra',
        'email': 'gerard.cuadra@gmail.com',
        'password': 'GerardCuadra123!',
        'phone': '+639696969696',
        'role': User.ROLE_EMPLOYEE,
    },
    # ── 5 seeded employees ──
    {
        'username': 'jdcruz',
        'first_name': 'Juan',
        'last_name': 'Dela Cruz',
        'email': 'juan.delacruz@maptech.com',
        'password': 'Employee123!',
        'phone': '+639171234567',
        'role': User.ROLE_EMPLOYEE,
    },
    {
        'username': 'mreyes',
        'first_name': 'Maria',
        'last_name': 'Reyes',
        'email': 'maria.reyes@maptech.com',
        'password': 'Employee123!',
        'phone': '+639181234567',
        'role': User.ROLE_EMPLOYEE,
    },
    {
        'username': 'rsantos',
        'first_name': 'Ricardo',
        'last_name': 'Santos',
        'email': 'ricardo.santos@maptech.com',
        'password': 'Employee123!',
        'phone': '+639191234567',
        'role': User.ROLE_EMPLOYEE,
    },
    {
        'username': 'agarcia',
        'first_name': 'Angela',
        'last_name': 'Garcia',
        'email': 'angela.garcia@maptech.com',
        'password': 'Employee123!',
        'phone': '+639201234567',
        'role': User.ROLE_EMPLOYEE,
    },
    {
        'username': 'bnavarro',
        'first_name': 'Bryan',
        'last_name': 'Navarro',
        'email': 'bryan.navarro@maptech.com',
        'password': 'Employee123!',
        'phone': '+639211234567',
        'role': User.ROLE_EMPLOYEE,
    },
]


class Command(BaseCommand):
    help = 'Seed the users_user table with default admin and employee accounts.'

    def handle(self, *args, **options):
        for data in SEED_USERS:
            password = data.pop('password')
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults=data,
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created {user.role} user: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {user.username}'))
            # Re-add password key for idempotency
            data['password'] = password
