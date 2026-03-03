# Script para iniciar Celery Beat (Scheduler)
# Ejecutar este script en una terminal separada (diferente al worker)

Write-Host "Iniciando Celery Beat Scheduler..." -ForegroundColor Green

# Activar entorno virtual
$venvPath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
    & $venvPath
} else {
    Write-Host "ADVERTENCIA: No se encontró el entorno virtual en .\venv" -ForegroundColor Red
}

# Verificar que el contenedor de Redis esté corriendo
Write-Host "Verificando contenedor de Redis..." -ForegroundColor Yellow
$redisContainer = docker ps --filter "name=allele_dinamic_redis" --filter "status=running" --format "{{.Names}}" 2>$null

if ($redisContainer -eq "allele_dinamic_redis") {
    Write-Host "Contenedor de Redis está corriendo correctamente" -ForegroundColor Green
    
    # Verificar conectividad con Redis en el contenedor
    $redisTest = docker exec allele_dinamic_redis redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "Redis responde correctamente en el contenedor" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: Redis no responde correctamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Contenedor de Redis no está corriendo." -ForegroundColor Red
    Write-Host "Inicia el contenedor con: docker-compose up -d redis" -ForegroundColor Yellow
    exit 1
}

# Configurar variable de entorno para conectar a Redis del contenedor
$env:CELERY_BROKER_URL = "redis://localhost:6379/0"
$env:CELERY_RESULT_BACKEND = "django-db"

# Verificar que las migraciones estén aplicadas
Write-Host "Verificando migraciones..." -ForegroundColor Yellow
python manage.py migrate

# Iniciar Celery Beat
Write-Host "Iniciando Celery Beat con DatabaseScheduler..." -ForegroundColor Green
celery -A project_site beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
