import logging
from .excel_nomenclators_base import ExcelNomenclatorsBase

logger = logging.getLogger(__name__)


class ExcelNomenclatorsByLocationStudy(ExcelNomenclatorsBase):
    output_sheet = "For3DProt_L"
