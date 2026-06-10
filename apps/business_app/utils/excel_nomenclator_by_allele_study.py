import logging
from .excel_nomenclators_base import ExcelNomenclatorsBase
from apps.business_app.models.study_type import StudyType


logger = logging.getLogger(__name__)


class ExcelNomenclatorsByAlleleStudy(ExcelNomenclatorsBase):
    output_sheet = StudyType.SHEET_NAME_GENETIC_ALLELE  # default value if none provided

    def __init__(self, output_sheet=None):
        """Allow overriding the output sheet name dynamically per study type."""
        if output_sheet:
            self.output_sheet = output_sheet
