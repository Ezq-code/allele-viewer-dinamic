import logging
from .excel_nomenclators_base import ExcelNomenclatorsBase

logger = logging.getLogger(__name__)


class ExcelNomenclatorsByAlleleStudy(ExcelNomenclatorsBase):
    output_sheet = "For3DAllele"

    def __init__(self, output_sheet=None):
        """Allow overriding the output sheet name dynamically per study type."""
        if output_sheet:
            self.output_sheet = output_sheet
