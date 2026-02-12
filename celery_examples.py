"""
Ejemplos de cómo usar tareas de Celery en las vistas de Django
==============================================================

Este archivo contiene ejemplos de integración de Celery en diferentes escenarios.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from celery.result import AsyncResult

from apps.users_app.tasks import (
    send_email_task,
    send_email_to_client_task,
    example_periodic_task,
    cleanup_old_data_task,
)


# =============================================================================
# EJEMPLO 1: Vista básica con tarea asíncrona
# =============================================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_notification_email(request):
    """
    Envía un correo de notificación de forma asíncrona.

    POST /api/send-notification/
    Body: {
        "email": "user@example.com",
        "subject": "Asunto del correo",
        "message": "Mensaje del correo"
    }
    """
    email = request.data.get("email")
    subject = request.data.get("subject")
    message = request.data.get("message")

    if not all([email, subject, message]):
        return Response(
            {"error": "email, subject y message son requeridos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Ejecutar tarea de forma asíncrona
    task = send_email_task.delay(
        subject=subject,
        message=message,
        html_message=f"<p>{message}</p>",
        recipient_list=[email],
    )

    return Response(
        {
            "message": "Correo enviado a la cola de procesamiento",
            "task_id": task.id,
            "status": "PENDING",
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 2: Vista que verifica el estado de una tarea
# =============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_task_status(request, task_id):
    """
    Verifica el estado de una tarea de Celery.

    GET /api/task-status/<task_id>/
    """
    task_result = AsyncResult(task_id)

    response_data = {
        "task_id": task_id,
        "status": task_result.state,
        "result": None,
    }

    if task_result.state == "PENDING":
        response_data["message"] = "La tarea está pendiente"
    elif task_result.state == "STARTED":
        response_data["message"] = "La tarea ha iniciado"
    elif task_result.state == "SUCCESS":
        response_data["message"] = "La tarea se completó exitosamente"
        response_data["result"] = task_result.result
    elif task_result.state == "FAILURE":
        response_data["message"] = "La tarea falló"
        response_data["error"] = str(task_result.info)
    elif task_result.state == "RETRY":
        response_data["message"] = "La tarea está reintentando"

    return Response(response_data)


# =============================================================================
# EJEMPLO 3: Vista con procesamiento en segundo plano
# =============================================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_file_async(request):
    """
    Procesa un archivo cargado de forma asíncrona.

    POST /api/process-file/
    Form-data: file
    """
    if "file" not in request.FILES:
        return Response(
            {"error": "No se proporcionó ningún archivo"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    uploaded_file = request.FILES["file"]

    # Aquí podrías guardar el archivo y pasar su ruta a la tarea
    # Por ejemplo: file_path = save_uploaded_file(uploaded_file)

    # Ejecutar tarea de procesamiento (necesitarías crear esta tarea)
    # task = process_file_task.delay(file_path)

    return Response(
        {
            "message": "Archivo en cola para procesamiento",
            # "task_id": task.id,
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 4: Vista que ejecuta múltiples tareas en paralelo
# =============================================================================

from celery import group


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_bulk_emails(request):
    """
    Envía múltiples correos en paralelo.

    POST /api/send-bulk-emails/
    Body: {
        "recipients": [
            {"email": "user1@example.com", "subject": "...", "message": "..."},
            {"email": "user2@example.com", "subject": "...", "message": "..."}
        ]
    }
    """
    recipients = request.data.get("recipients", [])

    if not recipients:
        return Response(
            {"error": "No se proporcionaron destinatarios"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Crear un grupo de tareas para ejecutar en paralelo
    job = group(
        [
            send_email_task.s(
                subject=recipient["subject"],
                message=recipient["message"],
                html_message=f"<p>{recipient['message']}</p>",
                recipient_list=[recipient["email"]],
            )
            for recipient in recipients
        ]
    )

    # Ejecutar el grupo
    result = job.apply_async()

    return Response(
        {
            "message": f"{len(recipients)} correos enviados a la cola",
            "group_id": result.id,
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 5: Vista que encadena tareas (una después de otra)
# =============================================================================

from celery import chain


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_and_notify(request):
    """
    Procesa datos y luego envía una notificación.

    POST /api/process-and-notify/
    """
    email = request.data.get("email")

    # Crear una cadena de tareas
    workflow = chain(
        # Primera tarea: procesar datos (ejemplo)
        example_periodic_task.s(),
        # Segunda tarea: enviar notificación con el resultado
        send_email_task.s(
            subject="Procesamiento completado",
            message="Tu procesamiento ha finalizado",
            html_message="<p>Tu procesamiento ha finalizado</p>",
            recipient_list=[email],
        ),
    )

    # Ejecutar la cadena
    result = workflow.apply_async()

    return Response(
        {
            "message": "Procesamiento iniciado",
            "chain_id": result.id,
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 6: Vista que ejecuta tarea con callback
# =============================================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_with_callback(request):
    """
    Ejecuta una tarea y llama a otra cuando termina.

    POST /api/process-with-callback/
    """
    email = request.data.get("email")

    # Ejecutar tarea con un callback
    task = example_periodic_task.apply_async(
        link=send_email_task.s(
            subject="Tarea completada",
            message="Tu tarea ha finalizado exitosamente",
            html_message="<p>Tu tarea ha finalizado exitosamente</p>",
            recipient_list=[email],
        )
    )

    return Response(
        {
            "message": "Tarea iniciada con callback",
            "task_id": task.id,
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 7: Vista que programa una tarea para el futuro
# =============================================================================

from datetime import datetime, timedelta


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def schedule_email(request):
    """
    Programa un correo para enviarse en el futuro.

    POST /api/schedule-email/
    Body: {
        "email": "user@example.com",
        "subject": "Recordatorio",
        "message": "Este es tu recordatorio",
        "minutes_from_now": 60
    }
    """
    email = request.data.get("email")
    subject = request.data.get("subject")
    message = request.data.get("message")
    minutes = request.data.get("minutes_from_now", 60)

    # Calcular cuándo ejecutar la tarea
    eta = datetime.now() + timedelta(minutes=minutes)

    # Programar la tarea
    task = send_email_task.apply_async(
        kwargs={
            "subject": subject,
            "message": message,
            "html_message": f"<p>{message}</p>",
            "recipient_list": [email],
        },
        eta=eta,  # Execute at this time
    )

    return Response(
        {
            "message": f"Correo programado para {eta.strftime('%Y-%m-%d %H:%M:%S')}",
            "task_id": task.id,
            "scheduled_time": eta.isoformat(),
        },
        status=status.HTTP_202_ACCEPTED,
    )


# =============================================================================
# EJEMPLO 8: Vista con manejo de errores y reintentos
# =============================================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def robust_email_send(request):
    """
    Envía un correo con manejo robusto de errores.

    POST /api/robust-email/
    """
    email = request.data.get("email")
    subject = request.data.get("subject")
    message = request.data.get("message")

    try:
        # Intentar enviar el correo con reintentos automáticos
        task = send_email_task.apply_async(
            kwargs={
                "subject": subject,
                "message": message,
                "html_message": f"<p>{message}</p>",
                "recipient_list": [email],
            },
            retry=True,
            retry_policy={
                "max_retries": 3,
                "interval_start": 0,
                "interval_step": 60,  # Esperar 60 segundos más cada vez
                "interval_max": 300,  # Máximo 5 minutos
            },
        )

        return Response(
            {
                "message": "Correo en cola con política de reintentos",
                "task_id": task.id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    except Exception as e:
        return Response(
            {"error": "Error al encolar el correo", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =============================================================================
# EJEMPLO 9: Vista que cancela una tarea
# =============================================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_task(request, task_id):
    """
    Cancela una tarea pendiente o en ejecución.

    POST /api/cancel-task/<task_id>/
    """
    task_result = AsyncResult(task_id)

    if task_result.state in ["PENDING", "STARTED"]:
        task_result.revoke(terminate=True)
        return Response({"message": "Tarea cancelada exitosamente", "task_id": task_id})
    else:
        return Response(
            {
                "error": "No se puede cancelar la tarea",
                "reason": f"La tarea está en estado: {task_result.state}",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =============================================================================
# EJEMPLO 10: Vista que obtiene todas las tareas activas
# =============================================================================

from project_site.celery import app as celery_app


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_active_tasks(request):
    """
    Lista todas las tareas activas.

    GET /api/active-tasks/
    """
    inspect = celery_app.control.inspect()

    active_tasks = inspect.active()
    scheduled_tasks = inspect.scheduled()

    return Response(
        {
            "active": active_tasks or {},
            "scheduled": scheduled_tasks or {},
        }
    )


# =============================================================================
# URLs de ejemplo para agregar a urls.py
# =============================================================================

"""
from django.urls import path
from . import celery_examples

urlpatterns = [
    path('send-notification/', celery_examples.send_notification_email),
    path('task-status/<str:task_id>/', celery_examples.check_task_status),
    path('process-file/', celery_examples.process_file_async),
    path('send-bulk-emails/', celery_examples.send_bulk_emails),
    path('process-and-notify/', celery_examples.process_and_notify),
    path('process-with-callback/', celery_examples.process_with_callback),
    path('schedule-email/', celery_examples.schedule_email),
    path('robust-email/', celery_examples.robust_email_send),
    path('cancel-task/<str:task_id>/', celery_examples.cancel_task),
    path('active-tasks/', celery_examples.list_active_tasks),
]
"""
