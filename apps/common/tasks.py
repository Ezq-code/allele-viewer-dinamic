from celery import shared_task
from .utils.pusher_client import PusherClient
import logging

logger = logging.getLogger(__name__)


@shared_task(name="common.send_pusher_trigger", ignore_result=True)
def send_pusher_trigger_task(channel, event, data):
    """
    Tarea asíncrona genérica para enviar eventos a través de Pusher.

    Args:
        channel: Canal de Pusher donde enviar el evento
        event: Nombre del evento
        data: Datos a enviar con el evento
    """
    try:
        pusher_client = PusherClient()
        pusher_client.trigger(channel, event, data)
        logger.info(f"Pusher trigger sent: channel={channel}, event={event}")
    except Exception as e:
        logger.error(f"Error sending Pusher trigger: {e}", exc_info=True)
        raise
