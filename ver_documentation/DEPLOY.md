# Despliegue con Docker y Nginx

Esta guía está alineada con la configuración actual de `docker-compose.yml`, `docker-compose-dev.yml`, `Dockerfile`, `entrypoint.sh` y `supervisord.conf`.

## Servicios actuales

En **producción** (`docker-compose.yml`) se levantan estos servicios:

- **postgres**: PostgreSQL 16
- **redis**: broker para Celery
- **web**: Django + Gunicorn + Celery Worker + Celery Beat (gestionados por `supervisord` dentro del mismo contenedor)
- **nginx**: proxy reverso y servidor de estáticos/media

> No existen servicios separados `celery_worker`/`celery_beat` en `docker-compose.yml`; ambos procesos corren dentro de `web`.

## Archivos relevantes

- `docker-compose.yml`: stack de producción
- `docker-compose-dev.yml`: servicios de apoyo para desarrollo (PostgreSQL + Redis)
- `Dockerfile`: imagen de aplicación Django/Celery
- `Dockerfile.nginx`: imagen de Nginx
- `entrypoint.sh`: espera DB, ejecuta migraciones, collectstatic e inicia `supervisord`
- `supervisord.conf`: procesos `gunicorn`, `celery_worker` y `celery_beat`
- `nginx.conf`: proxy a `web:8000`, rutas `/static_output/` y `/media/`

## Variables de entorno (`.env`)

Crear un archivo `.env` en la raíz con, al menos, estas variables:

```bash
# Django
SECRET_KEY=tu-secret-key-segura
DEBUG=False
ALLOWED_HOSTS=tudominio.com,www.tudominio.com,localhost,127.0.0.1

# Base de datos
DB_REMOTE_NAME=allele_viewer
DB_REMOTE_USER=postgres
DB_REMOTE_PASSWORD=password-seguro
DB_REMOTE_PORT=5432

# Email
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password
DEFAULT_FROM_EMAIL=noreply@tudominio.com
EMAIL_PORT=587

# Redis / Celery
REDIS_PORT=6380
CELERY_BASE_REDIS_URL=redis://redis:

# App
SESSION_EXPIRE_SECONDS=600
RUNNING_FROM=remote
NGINX_PORT=80

# Integraciones opcionales
SPREADSHEET_ID=
CREDENTIAL_FILE_NAME=google_sheet_auth_credentials.json
SENTRY_DSN=
SENTRY_SAMPLE_RATE=0.2
CACHE_DEFAULT_TIMEOUT=3600
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

> Nota: en `docker-compose.yml`, Redis publica por defecto `6380:6379`.

## Despliegue en producción

```bash
# 1) Construir imágenes
docker compose -f docker-compose.yml build

# 2) Levantar stack
docker compose -f docker-compose.yml up -d

# 3) Ver estado
docker compose -f docker-compose.yml ps

# 4) Ver logs
docker compose -f docker-compose.yml logs -f
```

## Verificación

- Aplicación: `http://localhost` (o tu dominio)
- Healthcheck Nginx: `http://localhost/health/`
- Admin Django: `http://localhost/admin/`

## Operación diaria

```bash
# Logs por servicio
docker compose -f docker-compose.yml logs -f web
docker compose -f docker-compose.yml logs -f nginx
docker compose -f docker-compose.yml logs -f postgres
docker compose -f docker-compose.yml logs -f redis

# Comandos Django
docker compose -f docker-compose.yml exec web python manage.py migrate
docker compose -f docker-compose.yml exec web python manage.py createsuperuser
docker compose -f docker-compose.yml exec web python manage.py shell

# Reinicio de servicios
docker compose -f docker-compose.yml restart web
docker compose -f docker-compose.yml restart nginx

# Parada
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml down -v
```

## Desarrollo con Docker

`docker-compose-dev.yml` solo levanta PostgreSQL y Redis:

```bash
docker compose -f docker-compose-dev.yml up -d
```

Luego puedes ejecutar Django/Celery localmente (fuera de Docker) si lo necesitas.

## Nginx y estáticos

- Nginx enruta tráfico al upstream `web:8000`
- Estáticos servidos desde `/static_output/` (alias `/app/static_output/`)
- Media servida desde `/media/` (alias `/app/media/`)
- Health endpoint en `/health/`

## Troubleshooting rápido

```bash
# Web no arranca
docker compose -f docker-compose.yml logs web

# Estado de PostgreSQL
docker compose -f docker-compose.yml exec postgres pg_isready -U ${DB_REMOTE_USER:-postgres}

# Redis
docker compose -f docker-compose.yml exec redis redis-cli ping

# Regenerar estáticos
docker compose -f docker-compose.yml exec web python manage.py collectstatic --noinput --clear
```

## Actualización

```bash
git pull origin dev
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml logs -f --tail=100
```

## Checklist mínimo de producción

- `DEBUG=False`
- `SECRET_KEY` robusta
- `ALLOWED_HOSTS` correcto
- credenciales de DB seguras
- revisión de puertos expuestos (PostgreSQL/Redis)
- backups de BD periódicos


## Ejemplo de correr comando concreto en container desplegado
`docker exec -w /app allele_dinamic_web python manage.py load_country_data`