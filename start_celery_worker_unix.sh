#!/bin/bash
# Script para iniciar Celery Worker
# Ejecutar este script en una terminal separada

echo -e "\033[32mIniciando Celery Worker...\033[0m"

# Activar entorno virtual
VENV_PATH="./venv/bin/activate"
if [ -f "$VENV_PATH" ]; then
    echo -e "\033[33mActivando entorno virtual...\033[0m"
    source "$VENV_PATH"
else
    echo -e "\033[31mADVERTENCIA: No se encontró el entorno virtual en ./venv\033[0m"
fi

# Verificar que el contenedor de Redis esté corriendo
echo -e "\033[33mVerificando contenedor de Redis...\033[0m"
REDIS_CONTAINER=$(docker ps --filter "name=allele_dinamic_redis" --filter "status=running" --format "{{.Names}}" 2>/dev/null)

if [ "$REDIS_CONTAINER" = "allele_dinamic_redis" ]; then
    echo -e "\033[32mContenedor de Redis está corriendo correctamente\033[0m"
    
    # Verificar conectividad con Redis en el contenedor
    REDIS_TEST=$(docker exec allele_dinamic_redis redis-cli ping 2>/dev/null)
    if [ "$REDIS_TEST" = "PONG" ]; then
        echo -e "\033[32mRedis responde correctamente en el contenedor\033[0m"
    else
        echo -e "\033[33mADVERTENCIA: Redis no responde correctamente\033[0m"
    fi
else
    echo -e "\033[31mERROR: Contenedor de Redis no está corriendo.\033[0m"
    echo -e "\033[33mInicia el contenedor con: docker compose up -d redis\033[0m"
    exit 1
fi

# Configurar variable de entorno para conectar a Redis del contenedor
export CELERY_BROKER_URL="redis://localhost:6379/0"
export CELERY_RESULT_BACKEND="django-db"

# Iniciar Celery Worker
echo -e "\033[32mIniciando Celery Worker...\033[0m"
celery -A project_site worker --loglevel=info

# Si falla, el script terminará con el código de error
