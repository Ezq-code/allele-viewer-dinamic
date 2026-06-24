import logging
import pusher
from django.conf import settings

logger = logging.getLogger(__name__)


class PusherClient:
    """Wrapper around pusher.Pusher that logs triggers for debugging."""

    # CHANNELS
    CELERY_TASK_CHANNEL = "celery-task-channel"

    # EVENTS
    SUCCESSFUL_UPLOAD_3D_EXCEL = "successful-upload-3d-excel"
    FAILED_UPLOAD_3D_EXCEL = "failed-upload-3d-excel"
    STUDY_PROCESSED = "study-processed"

    SUCCESSFUL_UPLOAD_CONFORMATION_EXCEL = "successful-upload-conformation-excel"
    FAILED_UPLOAD_CONFORMATION_EXCEL = "failed-upload-conformation-excel"

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # underlying pusher client
            cls._instance._client = pusher.Pusher(
                app_id=settings.PUSHER_APP_ID,
                key=settings.PUSHER_KEY,
                secret=settings.PUSHER_SECRET,
                cluster=settings.PUSHER_CLUSTER,
                ssl=True,
                timeout=30,
            )
        return cls._instance

    def trigger(self, channel, event, data):
        try:
            print(f"Pusher trigger -> channel={channel} event={event} data={data}")
            return self._client.trigger(channel, event, data)
        except Exception as e:
            logger.exception(
                f"Error triggering pusher event {event} on channel {channel}",
                exc_info=e,
            )
            raise
