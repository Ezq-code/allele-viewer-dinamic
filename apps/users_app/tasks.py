from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(name="send_email_task")
def send_email_task(subject, message, html_message, recipient_list, from_email=None):
    """
    Tarea asíncrona para enviar correos electrónicos.

    Args:
        subject: Asunto del correo
        message: Mensaje en texto plano
        html_message: Mensaje en HTML
        recipient_list: Lista de destinatarios
        from_email: Correo del remitente (opcional)

    Returns:
        int: Número de correos enviados exitosamente
    """
    try:
        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL

        result = send_mail(
            subject=subject,
            message=message,
            html_message=html_message,
            recipient_list=recipient_list,
            from_email=from_email,
            fail_silently=False,
        )
        logger.info(f"Email sent successfully to {recipient_list}")
        return result
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        raise


@shared_task(name="send_email_to_client_task")
def send_email_to_client_task(req_srv, email, textmail, time_to_complete):
    """
    Tarea asíncrona para enviar correo de notificación al cliente.

    Args:
        req_srv: Servicio solicitado
        email: Correo del destinatario
        textmail: Texto del mensaje
        time_to_complete: Tiempo estimado para completar

    Returns:
        int: Número de correos enviados exitosamente
    """
    ctx = {
        "user": email,
        "service": req_srv,
        "textmail": textmail,
        "time_to_complete": time_to_complete,
    }
    body = render_to_string(template_name="email/generic.html", context=ctx)
    html = render_to_string(template_name="email/service_requested.html", context=ctx)

    return send_email_task.delay(
        subject=f"Nuevo servicio de <{req_srv}> solicitado",
        message=body,
        html_message=html,
        recipient_list=[email],
        from_email="AmazonQva <soporte@amazonqva.com>",
    )


@shared_task(name="example_periodic_task")
def example_periodic_task():
    """
    Tarea de ejemplo para ser ejecutada periódicamente con Celery Beat.
    Esta tarea puede ser programada desde el admin de Django en django_celery_beat.

    Returns:
        str: Mensaje de confirmación
    """
    print("Ejecutando tarea periódica de ejemplo")
    # Aquí puedes agregar la lógica que necesites ejecutar periódicamente
    return "Tarea periódica ejecutada exitosamente"


@shared_task(name="cleanup_old_data_task")
def cleanup_old_data_task():
    """
    Tarea de ejemplo para limpieza de datos antiguos.
    Esta tarea puede ser programada para ejecutarse periódicamente.

    Returns:
        str: Mensaje de confirmación
    """
    logger.info("Ejecutando tarea de limpieza de datos")
    # Aquí puedes agregar la lógica para limpiar datos antiguos
    return "Limpieza de datos completada"
