FROM python:3.11-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema (mínimas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements completo (incluye todas las dependencias)
COPY requirements.txt /app/

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar solo los archivos necesarios para Celery
COPY project_site/ /app/project_site/
COPY apps/ /app/apps/
COPY manage.py /app/

# Crear usuario no-root para ejecutar la aplicación
RUN useradd -m -u 1000 celeryuser && \
    chown -R celeryuser:celeryuser /app

USER celeryuser

# El comando se especifica en docker-compose.yml
