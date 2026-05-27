import logging
from .excel_nomenclators_base import ExcelNomenclatorsBase

logger = logging.getLogger(__name__)


class ExcelNomenclatorsByAlleleStudy(ExcelNomenclatorsBase):
    output_sheet = "For3DAllele"
