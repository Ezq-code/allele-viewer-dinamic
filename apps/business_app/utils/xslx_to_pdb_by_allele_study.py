import logging


from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.study_type import StudyType
from apps.business_app.utils.excel_nomenclator_by_allele_study import (
    ExcelNomenclatorsByAlleleStudy,
)
from apps.business_app.utils.xslx_to_pdb import XslxToPdb
from apps.business_app.models.study import Study


logger = logging.getLogger(__name__)


class XslxToPdbByAlleleStudy(XslxToPdb):
    def __init__(self, origin_file, global_configuration, uploaded_file_id) -> None:
        self.gen_allele_study_type, _ = StudyType.objects.get_or_create(
            name=StudyType.STUDY_NAME_GENETIC_ALLELE,
            defaults={"sheet_name": StudyType.SHEET_NAME_GENETIC_ALLELE},
        )
        self.study, _ = Study.objects.get_or_create(
            study_type=self.gen_allele_study_type,
            uploaded_file_id=uploaded_file_id,
            successfull_load=True,
        )
        try:
            excel_nomenclator = ExcelNomenclatorsByAlleleStudy(
                output_sheet=self.gen_allele_study_type.sheet_name
            )
            super().__init__(
                origin_file,
                global_configuration,
                excel_nomenclator_class=excel_nomenclator,
            )
        except Exception as e:
            self.study.successfull_load = False
            self.study.extra_info = e.__str__()
            self.study.save()
            logger.exception(f"An error occurred during file parsing: {e}")
            raise ValueError(f"An error occurred during file parsing: {e}.") from e

        self.model = AlleleNode
