#!/bin/bash
# Script para iniciar el entorno de desarrollo completo
# Levanta Docker, Celery Worker, Celery Beat y el servidor Django

echo -e "\033[36m=== Iniciando Entorno de Desarrollo Completo ===\033[0m"
echo ""

# Variables para almacenar PIDs de procesos en background
WORKER_PID=""
BEAT_PID=""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "\033[33mDeteniendo servicios...\033[0m"
    
    if [ ! -z "$WORKER_PID" ]; then
        kill $WORKER_PID 2>/dev/null
    fi
    
    if [ ! -z "$BEAT_PID" ]; then
        kill $BEAT_PID 2>/dev/null
    fi
    
    echo -e "\033[32m✓ Celery Worker y Beat detenidos\033[0m"
    echo ""
    echo -e "\033[36mPara detener los contenedores Docker, ejecuta:\033[0m"
    echo -e "\033[37m  docker compose -f docker-compose-dev.yml down\033[0m"
    echo ""
    exit 0
}

# Registrar la función de limpieza para cuando se termine el script
trap cleanup SIGINT SIGTERM EXIT

# Cargar variables de entorno desde .env
if [ -f ".env" ]; then
    echo -e "\033[33m[0/5] Cargando variables de entorno desde .env...\033[0m"
    export $(grep -v '^#' .env | grep -v '^[[:space:]]*$' | xargs)
    echo -e "\033[32m✓ Variables de entorno cargadas\033[0m"
    echo ""
else
    echo -e "\033[33mADVERTENCIA: No se encontró el archivo .env\033[0m"
    echo ""
fi

# Activar entorno virtual
VENV_PATH="./venv/bin/activate"
if [ -f "$VENV_PATH" ]; then
    echo -e "\033[33m[1/5] Activando entorno virtual...\033[0m"
    source "$VENV_PATH"
    echo -e "\033[32m✓ Entorno virtual activado\033[0m"
else
    echo -e "\033[31mERROR: No se encontró el entorno virtual en ./venv\033[0m"
    echo -e "\033[33mEjecuta primero: python -m venv venv\033[0m"
    exit 1
fi

echo ""

# Levantar servicios de Docker (PostgreSQL y Redis)
echo -e "\033[33m[2/5] Levantando servicios Docker (PostgreSQL y Redis)...\033[0m"
docker compose -f docker-compose-dev.yml up -d

if [ $? -ne 0 ]; then
    echo -e "\033[31mERROR: No se pudieron levantar los servicios Docker\033[0m"
    exit 1
fi

echo -e "\033[32m✓ Servicios Docker iniciados\033[0m"
echo ""

# Esperar a que los servicios estén listos
echo -e "\033[33mEsperando a que los servicios estén listos...\033[0m"
sleep 5

# Verificar Redis
REDIS_TEST=$(docker exec allele_dinamic_redis redis-cli ping 2>/dev/null)
if [ "$REDIS_TEST" = "PONG" ]; then
    echo -e "\033[32m✓ Redis está listo\033[0m"
else
    echo -e "\033[33mADVERTENCIA: Redis no responde correctamente\033[0m"
fi

# Verificar PostgreSQL
docker exec allele_dinamic_postgres pg_isready -U postgres >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "\033[32m✓ PostgreSQL está listo\033[0m"
else
    echo -e "\033[33mADVERTENCIA: PostgreSQL no responde correctamente\033[0m"
fi

echo ""

# Aplicar migraciones
echo -e "\033[33m[3/5] Aplicando migraciones de base de datos...\033[0m"
python manage.py migrate
if [ $? -eq 0 ]; then
    echo -e "\033[32m✓ Migraciones aplicadas\033[0m"
else
    echo -e "\033[33mADVERTENCIA: Error al aplicar migraciones\033[0m"
fi

echo ""

# Configurar variables de entorno para Celery
export CELERY_BROKER_URL="redis://localhost:6379/0"
export CELERY_RESULT_BACKEND="django-db"

# Iniciar Celery Worker en segundo plano
echo -e "\033[33m[4/5] Iniciando Celery Worker...\033[0m"
celery -A project_site worker --loglevel=info > /tmp/celery_worker.log 2>&1 &
WORKER_PID=$!

sleep 2
if ps -p $WORKER_PID > /dev/null; then
    echo -e "\033[32m✓ Celery Worker iniciado (PID: $WORKER_PID)\033[0m"
else
    echo -e "\033[31mERROR: No se pudo iniciar Celery Worker\033[0m"
    docker compose -f docker-compose-dev.yml down
    exit 1
fi

echo ""

# Iniciar Celery Beat en segundo plano
echo -e "\033[33m[5/5] Iniciando Celery Beat...\033[0m"
celery -A project_site beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler > /tmp/celery_beat.log 2>&1 &
BEAT_PID=$!

sleep 2
if ps -p $BEAT_PID > /dev/null; then
    echo -e "\033[32m✓ Celery Beat iniciado (PID: $BEAT_PID)\033[0m"
else
    echo -e "\033[31mERROR: No se pudo iniciar Celery Beat\033[0m"
    kill $WORKER_PID 2>/dev/null
    docker compose -f docker-compose-dev.yml down
    exit 1
fi

echo ""
echo -e "\033[32m=== Todos los servicios iniciados correctamente ===\033[0m"
echo ""
echo -e "\033[36mServicios activos:\033[0m"
echo -e "\033[37m  • PostgreSQL:    localhost:5432\033[0m"
echo -e "\033[37m  • Redis:         localhost:6379\033[0m"
echo -e "\033[37m  • Celery Worker: PID $WORKER_PID\033[0m"
echo -e "\033[37m  • Celery Beat:   PID $BEAT_PID\033[0m"
echo ""
echo -e "\033[36mLogs disponibles en:\033[0m"
echo -e "\033[37m  • Worker: /tmp/celery_worker.log\033[0m"
echo -e "\033[37m  • Beat:   /tmp/celery_beat.log\033[0m"
echo ""
echo -e "\033[33mIniciando servidor de desarrollo Django...\033[0m"
echo -e "\033[37mPresiona Ctrl+C para detener todos los servicios\033[0m"
echo ""

# Iniciar servidor Django (se ejecuta en primer plano)
python manage.py runserver
