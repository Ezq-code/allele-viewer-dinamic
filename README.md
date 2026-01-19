
# STEPS FOR CLONING For Test
```
cd existing_folder
git remote add origin https://gitlab.com/ealmeida.cu/allele-viewer.git
git branch -M main
git push -uf origin main
```

# STEPS FOR DEVELOPING

## Initial Setup

1.  when the code is already cloned, create a python virtual enviroment:
```bash
python -m venv venv
```

2. Activate virtual enviroment:
```bash
source /venv/bin/activate # for linux
source /venv/Scripts/activate # for windows (there's other ways too)
```

3. Install required packages running in the console:
```bash
pip install -r requirements.txt
```

4. Make a copy of REFERENCE.env in the same directory and remove the filename. Finally the file should exists with the name: .env

5. Run migrations (with this we have created a superuser):
```bash
python manage.py migrate
```

6. Create some dummy user objects (300):
```bash
python manage.py create_test_users 10
```

7. run server:
```bash
python manage.py runserver
```

8. interact with API, available on:
- http://127.0.0.1:8000/api/swagger/
- http://127.0.0.1:8000/api/swagger-redoc/

9. If if needed to run locally over https:
```bash
python manage.py runserver_plus --cert-file localhost.crt --key-file localhost.key
```

## Celery Configuration (Async Tasks & Scheduled Jobs)

### Quick Start

**Prerequisites:** Redis debe estar instalado y corriendo.

```powershell
# Verificar Redis
redis-cli ping  # Debe responder: PONG

# Iniciar Celery (Windows)
.\start_celery_worker.ps1   # Terminal 1
.\start_celery_beat.ps1     # Terminal 2

# O manualmente
celery -A project_site worker --loglevel=info --pool=solo
celery -A project_site beat --loglevel=info
```

**Con Docker (solo Redis):**
```powershell
docker compose up -d redis
.\start_celery_worker.ps1
.\start_celery_beat.ps1
```

📚 **Documentación completa:** Ver [`CELERY.md`](./CELERY.md) para guía detallada, ejemplos y troubleshooting.

---

## Development Tips

!!!For BE Develop...

pip-chill >.\req.txt