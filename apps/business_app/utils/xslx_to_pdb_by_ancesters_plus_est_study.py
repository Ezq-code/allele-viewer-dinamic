import logging


from apps.business_app.models.study_type import StudyType
from apps.business_app.utils.excel_nomenclator_by_ancesters_plus_est_study import (
    ExcelNomenclatorsByAncestersPlusEstStudy,
)
from apps.business_app.utils.xslx_to_pdb_by_protein import XslxToPdbByProtein
from apps.business_app.models.study import Study
from apps.business_app.models.protein_node import ProteinNode


logger = logging.getLogger(__name__)


class XslxToPdbByAncestersPlusEstStudy(XslxToPdbByProtein):
    def __init__(self, origin_file, global_configuration, uploaded_file_id) -> None:
        self.gen_allele_study_type, _ = StudyType.objects.get_or_create(
            name=StudyType.STUDY_NAME_ANCESTERS_PLUS_EST,
            defaults={"sheet_name": StudyType.SHEET_NAME_ANCESTERS_PLUS_EST},
        )
        self.study, _ = Study.objects.get_or_create(
            study_type=self.gen_allele_study_type,
            uploaded_file_id=uploaded_file_id,
            successfull_load=True,
        )
        try:
            excel_nomenclator = ExcelNomenclatorsByAncestersPlusEstStudy(
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

        self.model = ProteinNode
