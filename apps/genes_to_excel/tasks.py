import logging
import os

from celery import shared_task

from apps.genes_to_excel.utils.xslx_reader import XslxReader


from apps.common.utils.pusher_client import PusherClient

from apps.common.tasks import send_pusher_trigger_task

logger = logging.getLogger(__name__)


@shared_task(name="process_genes_to_excel_file_task")
def process_genes_to_excel_file_task(file_path, uploaded_file_id):
    logger.info(
        "Starting async processing of genes file %s for upload %s",
        file_path,
        uploaded_file_id,
    )
    try:
        processor_object = XslxReader(file_path)
        file_name = os.path.basename(file_path)
        results = processor_object.proccess_file(
            file_name=file_name, uploaded_file_id=uploaded_file_id
        )

        logger.info(
            "Successfully processed genes file %s for upload %s",
            file_path,
            uploaded_file_id,
        )
        send_pusher_trigger_task(
            channel=PusherClient.CELERY_TASK_CHANNEL,
            event=PusherClient.SUCCESSFUL_UPLOAD_SOM_EXCEL,
            data={"result": results},
        )

        return {
            "status": "success",
            "file_path": file_path,
            "uploaded_file_id": uploaded_file_id,
            "resultados": results,
        }
    except Exception as e:
        logger.exception("Error processing genes file %s: %s", file_path, str(e))
        send_pusher_trigger_task(
            channel=PusherClient.CELERY_TASK_CHANNEL,
            event=PusherClient.FAILED_UPLOAD_SOM_EXCEL,
            data={"error_detail": str(e)},
        )

        from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles

        GenesToExcelFiles.objects.filter(id=uploaded_file_id).delete()
        raise
