# AGENTS.md

This repository is a Django 5 + DRF application that renders genetic allele studies as interactive 3D molecular graphs. The backend is Python/Django and the frontend is static JavaScript with no build pipeline.

## Start here

- Project setup and local workflow: [ver_documentation/README.md](ver_documentation/README.md)
- Celery setup and troubleshooting: [ver_documentation/CELERY.md](ver_documentation/CELERY.md)
- Repo-level agent instructions: [.github/agents/python-structure-optimizer.agent.md](.github/agents/python-structure-optimizer.agent.md)

## Working rules for AI coding agents

- Prefer the existing app structure over new abstractions. Domain logic is organized by app and often by model-specific modules under each app.
- Keep backend changes in Python/Django code unless the task explicitly requires a frontend fix.
- Add or update automated tests for every new backend behavior; do not rely on manual validation alone.
- Do not touch the production deployment branch without explicit instruction.
- Verify with the smallest relevant command before finishing: targeted `pytest` for behavior and `ruff check .` for lint if the change affects Python files.

## Local commands

Run from the repo root with the committed virtual environment:

```powershell
pip install -r requirements.txt
Copy-Item REFERENCE.env .env
python manage.py migrate
python manage.py runserver
pytest
ruff check .
```

For async jobs and local services:

```powershell
docker compose -f docker-compose-dev.yml up -d
celery -A project_site worker --loglevel=info --pool=solo
celery -A project_site beat --loglevel=info
.\start_dev_win.ps1
```

Swagger UI: `http://127.0.0.1:8000/api/swagger/`

## Architecture notes

- `project_site/` holds the Django project settings and Celery wiring. Settings load `.env` using `django-environ`; `RUNNING_FROM=local|remote` switches SQLite vs Postgres.
- `apps/business_app/` is the core domain. Models, views, serializers, and related logic are split into model-specific modules, then routed through a single DRF router.
- API routes are versioned by domain (`/business-gestion/`, `/user-gestion/`, `/allele-formation/`, `/allele-mapping/`). Server-rendered pages live at root-level routes and are handled by the user app.
- Data pipeline: upload -> Celery task -> xlsx-to-PDB conversion -> graph generation -> Pusher event (`study-processed`) for the frontend reload.
- App JS lives under `static/assets/dist/js/` and is included directly in templates; there is no npm build step for the viewer code.

## Common gotchas

- Missing `.env` keys can crash settings at import time.
- `DEBUG=True` keeps LocMemCache and skips Sentry; production uses Redis cache and initializes Sentry.
- Local SQLite + Celery locks are intentionally configured with `CONN_MAX_AGE=0`; do not “fix” this as a side effect of unrelated work.
- Frontend globals in the 3D viewer are shared and fragile; inline `onclick` handlers and generated UI code are easy to break if renamed casually.
- Commit messages are usually short and in Spanish.
