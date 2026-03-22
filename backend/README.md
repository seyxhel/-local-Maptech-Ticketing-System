# Tickets Backend (Django)

Quick API backend for ticketing system.

### Command for one click running server
####  cd backend  
####  powershell -ExecutionPolicy Bypass -File .\setup_backend.ps1



Setup

1. Create a virtualenv and install requirements:

```bash
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt
```

2. Apply migrations and run server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

3. Seed default users (optional — creates client, admin, and employee accounts):

```bash
python manage.py seed_users
python manage.py seed_services
python manage.py seed_categories
python manage.py seed_products
```

API

- List/create: `GET/POST /api/tickets/`
- Retrieve/update/delete: `/api/tickets/{id}/`

Railway Media Uploads

- Profile pictures and other uploaded files are served from Django `MEDIA_URL` and stored in `MEDIA_ROOT`.
- In Railway, attach a persistent volume to the backend service and set:
	- `MEDIA_ROOT=/data/media` (or your mounted volume path)
	- Optional: `MEDIA_URL=/media/` (default already)
- This is required so uploaded files are not lost on restart/redeploy.
