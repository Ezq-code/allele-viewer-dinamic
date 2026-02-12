from celery import shared_task
import logging

from apps.allele_mapping.utils.xslx_reader import XslxReader

logger = logging.getLogger(__name__)


@shared_task(name="process_allele_mapping_file")
def process_allele_mapping_file(file_path, uploaded_file_id):
    """
    Tarea asíncrona para procesar archivos de mapeo de alelos.

    Args:
        file_path: Ruta del archivo a procesar
        uploaded_file_id: ID del registro AlleleMappingFiles

    Returns:
        dict: Resultado del procesamiento
    """
    try:
        logger.info(
            f"Starting async processing of file {file_path} for upload {uploaded_file_id}"
        )

        # Crear instancia de XslxReader y procesar el archivo
        processor_object = XslxReader(file_path)
        processor_object.proccess_file(uploaded_file_id)

        logger.info(
            f"Successfully processed file {file_path} for upload {uploaded_file_id}"
        )

        return {
            "status": "success",
            "file_path": file_path,
            "uploaded_file_id": uploaded_file_id,
        }

    except Exception as e:
        logger.error(f"Error processing file {file_path}: {str(e)}")
        raise
