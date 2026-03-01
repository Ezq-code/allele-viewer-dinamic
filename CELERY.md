# 🚀 Celery & Celery Beat - Guía Completa

## 📋 Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Configuración Docker](#configuración-docker)
3. [Crear Tareas](#crear-tareas)
4. [Tareas Programadas](#tareas-programadas)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Comandos Útiles](#comandos-útiles)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Inicio Rápido

### Prerequisitos
- Redis (broker de mensajes)
- Python 3.8+

### 1. Instalar Redis

**Windows (WSL2):**
```powershell
wsl sudo service redis-server start
```

**Linux:**
```bash
sudo apt install redis-server && sudo systemctl start redis-server
```

**macOS:**
```bash
brew install redis && brew services start redis
```

**Verificar:**
```powershell
redis-cli ping  # Debe responder: PONG
```

### 2. Instalar Dependencias

```powershell
pip install -r requirements.txt
python manage.py migrate
```

### 3. Iniciar Celery

**Windows (con scripts):**
```powershell
# Terminal 1 - Worker
.\start_celery_worker.ps1

# Terminal 2 - Beat Scheduler
.\start_celery_beat.ps1
```

**Linux/macOS (con scripts):**
```bash
# Terminal 1 - Worker
./start_celery_worker.sh

# Terminal 2 - Beat Scheduler
./start_celery_beat.sh
```

**Manualmente:**
```powershell
# Windows - Terminal 1 - Worker
celery -A project_site worker --loglevel=info --pool=solo

# Windows - Terminal 2 - Beat
celery -A project_site beat --loglevel=info
```

```bash
# Linux/macOS - Todo junto (desarrollo)
celery -A project_site worker --beat --loglevel=info

# O separado (producción)
celery -A project_site worker --loglevel=info  # Terminal 1
celery -A project_site beat --loglevel=info     # Terminal 2
```

---

## 🐳 Configuración Docker

### Opción 1: Solo Redis en Docker (Recomendado para desarrollo)

```powershell
# Iniciar solo Redis
docker compose up -d redis

# Ejecutar Celery localmente
.\start_celery_worker.ps1
.\start_celery_beat.ps1
```

**Ventajas:** Rápido, fácil debugging, hot-reload funciona

### Opción 2: Todo en Docker

```powershell
# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f celery_worker celery_beat

# Ejecutar migraciones (primera vez)
docker compose exec celery_worker python manage.py migrate
```

**Ventajas:** Entorno aislado, similar a producción

### Configuración de .env


---

## ✍️ Crear Tareas

### 1. Tarea Básica

```python
# apps/mi_app/tasks.py
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(name="mi_tarea")
def mi_tarea(param1, param2):
    """Descripción de la tarea."""
    try:
        resultado = param1 + param2
        logger.info(f"Resultado: {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise
```

### 2. Tarea con Reintentos

```python
@shared_task(
    name="tarea_con_reintentos",
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def tarea_con_reintentos(self, param):
    try:
        # Tu lógica
        pass
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

### 3. Ejecutar desde el Código

```python
from apps.users_app.tasks import send_email_task

# Ejecutar asíncronamente
task = send_email_task.delay(
    subject="Test",
    message="Mensaje de prueba",
    html_message="<p>Mensaje de prueba</p>",
    recipient_list=["usuario@example.com"]
)

print(f"Task ID: {task.id}")
print(f"Status: {task.state}")
```

### 4. Verificar Estado de Tarea

```python
from celery.result import AsyncResult

task_id = "identificador-de-tarea"
result = AsyncResult(task_id)

print(f"Estado: {result.state}")        # PENDING, STARTED, SUCCESS, FAILURE
print(f"Resultado: {result.result}")    # Resultado si SUCCESS
print(f"Error: {result.info}")          # Info de error si FAILURE
```

---

## 📅 Tareas Programadas

### Usando Django Admin

1. Ir a: http://localhost:8000/admin/django_celery_beat/periodictask/
2. Click en "Add Periodic Task"
3. Configurar:
   - **Name:** Nombre descriptivo
   - **Task:** Seleccionar tarea (ej: `example_periodic_task`)
   - **Interval:** Crear intervalo (ej: cada 3600 segundos = 1 hora)
   - **Enabled:** ✓ Activar

### Tipos de Schedule

**1. Interval** - Cada X tiempo:
- Cada 10 segundos: `every=10, period=seconds`
- Cada 1 hora: `every=1, period=hours`
- Cada 1 día: `every=1, period=days`

**2. Crontab** - Horarios específicos:
- `* * * * *` - Cada minuto
- `0 * * * *` - Cada hora
- `0 0 * * *` - Diario a medianoche
- `0 9 * * 1` - Lunes a las 9 AM
- `*/15 * * * *` - Cada 15 minutos

### Programar Tarea para el Futuro

```python
from datetime import datetime, timedelta

# Ejecutar en 60 minutos
eta = datetime.now() + timedelta(minutes=60)
task = send_email_task.apply_async(
    kwargs={'subject': 'Test', ...},
    eta=eta
)
```

---

## 💡 Ejemplos de Uso

### Enviar Email Asíncrono (Vista)

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.users_app.tasks import send_email_task

@api_view(['POST'])
def send_notification(request):
    task = send_email_task.delay(
        subject=request.data['subject'],
        message=request.data['message'],
        html_message=f"<p>{request.data['message']}</p>",
        recipient_list=[request.data['email']]
    )
    
    return Response({
        "message": "Email en cola",
        "task_id": task.id
    }, status=202)
```

### Verificar Estado de Tarea (Vista)

```python
@api_view(['GET'])
def check_task(request, task_id):
    result = AsyncResult(task_id)
    return Response({
        "task_id": task_id,
        "status": result.state,
        "result": result.result if result.state == 'SUCCESS' else None
    })
```

### Múltiples Tareas en Paralelo

```python
from celery import group

job = group([
    send_email_task.s(subject="Test 1", ...),
    send_email_task.s(subject="Test 2", ...),
    send_email_task.s(subject="Test 3", ...)
])
result = job.apply_async()
```

### Encadenar Tareas

```python
from celery import chain

workflow = chain(
    process_data_task.s(data),
    send_notification_task.s(email="user@example.com")
)
result = workflow.apply_async()
```

---

## 🔧 Comandos Útiles

```powershell
# Ver tareas registradas
celery -A project_site inspect registered

# Ver workers activos
celery -A project_site inspect active

# Ver tareas programadas
celery -A project_site inspect scheduled

# Ver estadísticas
celery -A project_site inspect stats

# Purgar todas las tareas pendientes
celery -A project_site purge

# Instalar Flower (monitor web)
pip install flower
celery -A project_site flower
# Abrir: http://localhost:5555
```

### Docker

```powershell
# Ver logs en tiempo real
docker compose logs -f celery_worker celery_beat

# Reiniciar worker
docker compose restart celery_worker

# Reconstruir imagen
docker compose build celery_worker

# Ejecutar comando en contenedor
docker compose exec celery_worker python manage.py shell
```

---

## 🐛 Solución de Problemas

### Redis no conecta

```powershell
# Verificar Redis
redis-cli ping  # Debe responder: PONG

# Iniciar Redis (Windows WSL)
wsl sudo service redis-server start

# Iniciar Redis (Linux)
sudo systemctl start redis-server

# Ver logs de Redis (Docker)
docker compose logs redis
```

### Worker no encuentra tareas

```powershell
# Reiniciar con auto-reload
celery -A project_site worker --loglevel=info --pool=solo --reload

# Verificar que las tareas están registradas
celery -A project_site inspect registered
```

### Error "Consumer: Cannot connect to redis"

Verificar variables en `.env`:
```env
REDIS_PORT=6379
CELERY_BASE_REDIS_URL=redis://localhost:
```

Si usas Docker:
```env
CELERY_BASE_REDIS_URL=redis://redis:
```

### Tareas no se ejecutan

1. ✓ Worker está corriendo
2. ✓ Beat está corriendo (para tareas programadas)
3. ✓ Redis está accesible
4. ✓ Tarea está habilitada en admin (si es periódica)
5. ✓ Migraciones aplicadas: `python manage.py migrate`

### Error en Windows: "pool"

```powershell
# Usar pool=solo
celery -A project_site worker --loglevel=info --pool=solo

# O instalar gevent
pip install gevent
celery -A project_site worker --loglevel=info --pool=gevent
```

### Docker: Imagen tarda mucho en construir

```powershell
# Usar requirements_celery.txt (solo dependencias esenciales)
docker compose build --no-cache

# Verificar que .dockerignore excluye venv/ y __pycache__/
```

---

## 📊 Arquitectura del Proyecto

```
project_site/
├── celery.py              # Configuración de Celery
├── __init__.py            # Importa celery_app
└── settings.py            # Variables CELERY_*

apps/users_app/
└── tasks.py               # Tareas de ejemplo
    ├── send_email_task
    ├── send_email_to_client_task
    ├── example_periodic_task
    └── cleanup_old_data_task

Archivos de configuración:
├── requirements_celery.txt    # Deps mínimas para Docker
├── start_celery_worker.ps1    # Script de inicio (Windows)
├── start_celery_beat.ps1      # Script de inicio (Windows)
├── Dockerfile                 # Imagen Docker de Celery
└── docker-compose.yml         # Servicios Docker
```

---

## 🎯 Mejores Prácticas

1. **Nombres descriptivos** para tareas: `@shared_task(name="send_welcome_email")`
2. **Logging** en todas las tareas para debugging
3. **Manejo de excepciones** apropiado con reintentos
4. **Timeouts** para evitar tareas colgadas: `time_limit=300`
5. **Idempotencia**: Las tareas deben poder ejecutarse múltiples veces sin efectos secundarios
6. **Tareas pequeñas**: Dividir tareas grandes en sub-tareas
7. **Validación de entrada**: Validar parámetros antes de procesar
8. **Testing**: Testear tareas antes de producción
9. **Monitoreo**: Usar Flower o logs para monitorear
10. **Documentación**: Docstrings claros en cada tarea

---

## 📚 Archivos Relacionados

- `celery_examples.py` - 10 ejemplos completos de integración en vistas
- `apps/users_app/tasks.py` - Tareas de ejemplo funcionales
- `DOCKER_CELERY_SETUP.md` - Instrucciones detalladas de Docker

---

## 🔗 Referencias

- [Documentación Celery](https://docs.celeryq.dev/)
- [Django Celery Beat](https://django-celery-beat.readthedocs.io/)
- [Django Celery Results](https://django-celery-results.readthedocs.io/)

---

**✅ Estado:** Integración completa y funcional

**Fecha:** 15 de enero de 2026
