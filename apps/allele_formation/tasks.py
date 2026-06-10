import logging
from celery import shared_task

from apps.common.utils.pusher_client import PusherClient
from apps.common.tasks import send_pusher_trigger_task


logger = logging.getLogger(__name__)


@shared_task(name="process_uploaded_snp_file_task")
def process_uploaded_snp_file_task(uploaded_file_id):
    from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles
    from apps.allele_formation.utils.excel_snp_reader import ExcelSNPReader

    uploaded_file = UploadedSNPFiles.objects.get(id=uploaded_file_id)
    try:
        processor_object = ExcelSNPReader(uploaded_file.snp_file)
        processor_object.proccess_sheets(uploaded_file_id)

        send_pusher_trigger_task.delay(
            channel=PusherClient.CELERY_TASK_CHANNEL,
            event=PusherClient.SUCCESSFUL_UPLOAD_CONFORMATION_EXCEL,
            data={"uploaded_file_id": uploaded_file_id},
        )

        return {"status": "success", "uploaded_file_id": uploaded_file_id}
    except Exception as e:
        logger.exception(
            "Error processing uploaded SNP file %s: %s",
            uploaded_file_id,
            e,
            exc_info=True,
        )

        send_pusher_trigger_task.delay(
            channel=PusherClient.CELERY_TASK_CHANNEL,
            event=PusherClient.FAILED_UPLOAD_CONFORMATION_EXCEL,
            data={"error_detail": str(e)},
        )
        raise
