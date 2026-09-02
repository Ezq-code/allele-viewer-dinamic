# AGENTS.md

Django 5 + DRF app that renders genetic allele studies as interactive 3D molecular graphs ($3Dmol.js). Python/Django backend; vanilla-JS frontend with no build step.

## Commands

Run from repo root with the committed venv (`.\venv\Scripts\Activate.ps1` on Windows, `source venv/bin/activate` on Unix).

```powershell
pip install -r requirements.txt
Copy-Item REFERENCE.env .env          # REQUIRED: settings read .env at import time

python manage.py migrate
python manage.py runserver            # SQLite when RUNNING_FROM=local
python manage.py load_gene_data       # seed gene data

pytest                                # whole suite (~60 tests; pytest.ini -> project_site.settings)
pytest apps/business_app/tests.py                          # one file
pytest apps/business_app/tests.py::test_name               # one test
ruff check .                           # lint (installed via requirements; no config file, default rules)

docker compose -f docker-compose-dev.yml up -d    # Postgres + Redis for local Celery
celery -A project_site worker --loglevel=info --pool=solo   # Windows requires --pool=solo
celery -A project_site beat --loglevel=info
.\start_dev_win.ps1                    # full local stack: docker, migrate, celery worker+beat, runserver
```

Swagger UI: `http://127.0.0.1:8000/api/swagger/`

## Architecture

- `project_site/` — Django project (`settings.py`, `urls.py`, `celery.py`). Settings load `.env` via django-environ; `RUNNING_FROM=local|remote` switches SQLite <-> Postgres credentials.
- `apps/business_app` — core domain (genes, studies, allele/protein nodes, PDB files, regions, markers...). Models/views/serializers are split into **per-model module files** (`models/gene.py`, `views/gene.py`, ...) and registered on a single DRF `ExtendedSimpleRouter` in `apps/business_app/urls.py`.
- API prefixes: `/business-gestion/`, `/user-gestion/`, `/allele-formation/`, `/allele-mapping/`. Server-rendered pages sit at root paths (`/alleleviewer/`, `/uploadfile/`, ...) and route through `apps/users_app` `pages` views.
- `apps/common` — shared middleware, pagination, `PusherClient`.
- Data pipeline: Excel upload -> Celery tasks (`apps/business_app/tasks.py`) -> xlsx-to-PDB converters in `apps/business_app/utils/xslx_to_pdb_*.py` + `graph_functions.py` (networkx) -> Pusher event `study-processed` on channel `celery-task-channel` tells the frontend to reload the gene list.
- DRF defaults: session auth + `IsAuthenticated`, ORJSON renderer, page size 10.

## Frontend (no bundler)

- App JS lives in `static/assets/dist/js/` and is included directly by templates in `templates/`. There is no npm/build/test pipeline for app code.
- `alleleviewer.js` (~3.4k lines) is the $3Dmol.js graph viewer; it and `tools.js` (`graficar_string`, axes, planes) work entirely through shared globals (`viewer`, `datos`, `globalData`, `familyVisibility`, ...).
- Many viewer functions are invoked from inline `onclick` attributes in templates and dynamically generated toasts — renaming them breaks the UI silently.
- Dev serves `/static/`; production serves `/static_output/` after `collectstatic` (nginx volume).

## Gotchas & conventions

- **Pushing to `main` auto-deploys to production** (`.github/workflows/django.yml` SSHes to the server, pulls, `docker compose build/down/up`). Never commit or push to `main` unless explicitly requested.
- CI runs **no tests or lint** — always verify locally with `pytest` + `ruff check` before finishing.
- New backend functionality must come with automated tests (team rule encoded in `.github/agents/python-structure-optimizer.agent.md`); avoid touching frontend assets unless the task requires it.
- Missing `.env` keys crash settings at import (`SECRET_KEY`, `SESSION_EXPIRE_SECONDS` and several others have no defaults).
- `DEBUG=True` keeps LocMemCache and skips Sentry; production uses Redis cache and initializes Sentry.
- Local SQLite + Celery can deadlock on locks: `CONN_MAX_AGE=0` for `local` is intentional — do not "fix" it.
- Commit messages in this repo are short summaries, usually in Spanish.
