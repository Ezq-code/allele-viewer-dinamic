import logging
import os

from celery import shared_task

from apps.genes_to_excel.utils.xslx_reader import XslxReader

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
        nombre_archivo = os.path.basename(file_path)
        resultados = processor_object.proccess_file(processor_object.df, nombre_archivo)

        logger.info(
            "Successfully processed genes file %s for upload %s",
            file_path,
            uploaded_file_id,
        )

        return {
            "status": "success",
            "file_path": file_path,
            "uploaded_file_id": uploaded_file_id,
            "resultados": resultados,
        }
    except Exception as e:
        logger.error("Error processing genes file %s: %s", file_path, str(e))
        from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles

        GenesToExcelFiles.objects.filter(id=uploaded_file_id).delete()
        raise
