import logging
from celery import shared_task



logger = logging.getLogger(__name__)


@shared_task(name="process_uploaded_snp_file_task")
def process_uploaded_snp_file_task(uploaded_file_id):
    from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles
    from apps.allele_formation.utils.excel_snp_reader import ExcelSNPReader

    uploaded_file = UploadedSNPFiles.objects.get(id=uploaded_file_id)
    processor_object = ExcelSNPReader(uploaded_file.snp_file)
    processor_object.proccess_sheets(uploaded_file_id)
