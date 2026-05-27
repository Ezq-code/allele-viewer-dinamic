import logging
from .excel_nomenclators_base import ExcelNomenclatorsBase

logger = logging.getLogger(__name__)


class ExcelNomenclatorsByAncestersStudy(ExcelNomenclatorsBase):
    output_sheet = "For3DProt_A"
