import logging
import sys
import pandas as pd

import itertools

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.utils.excel_nomenclators import ExcelNomenclators
from django.core.files.base import ContentFile


logger = logging.getLogger(__name__)


class ExcelReader:
    def __init__(self, origin_file) -> None:
        self.origin_file = origin_file
        _elements_symbol_pool = (
            "LI",
            "BE",
            "B",
            "N",
            "F",
            "NA",
            "TA",
            "Au",
        )
        self.elements_symbol_iterator = itertools.cycle(_elements_symbol_pool)

        self._output_mandatory_columns_for_validation = (
            ExcelNomenclators.output_allele_column_name,
            ExcelNomenclators.output_number_column_name,
            ExcelNomenclators.output_region_column_name,
            ExcelNomenclators.output_rs_column_name,
            ExcelNomenclators.output_parent_column_name,
            ExcelNomenclators.output_symbol_column_name,
            "X0",
            "Y0",
            "Z0",
        )
        self.coordinates_sets = 0

        self.son_label = "I-L-U?"  # ? UNUSED
        # dataframes = pd.read_excel(self.origin_file, sheet_name=None, engine="openpyxl")

        self.output_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelNomenclators.output_sheet,
            engine="openpyxl",
        )
        # self.temp_df = pd.read_excel(
        #     self.origin_file, sheet_name=ExcelNomenclators.tmp_sheet, engine="openpyxl"
        # )

        self._validate_output_sheet_file_structure()

    def _validate_output_sheet_file_structure(self):
        first_row_output = self.output_df.iloc[0]
        for column in self._output_mandatory_columns_for_validation:
            try:
                first_row_output[column]
            except KeyError as e:
                logger.error(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{ExcelNomenclators.output_sheet}' "
                    f"has at least the next column missing: {column}."
                )
        else:
            for index in range(sys.maxsize):
                try:
                    _, _, _ = (
                        first_row_output[f"X{index}"],
                        first_row_output[f"Y{index}"],
                        first_row_output[f"Z{index}"],
                    )
                    self.coordinates_sets += 1
                except KeyError:
                    break

    def create_pdb_and_persist_on_db(
        self, memory_file, pdb_filename_base, suffix, uploaded_file_id
    ):
        file_content = memory_file.getvalue()
        custom_name = f"{pdb_filename_base}-{suffix}.pdb"
        file_obj = ContentFile(file_content, name=custom_name)
        PdbFiles.objects.create(
            custom_name=custom_name,
            description="",
            original_file_id=uploaded_file_id,
            file=file_obj,
        )
        memory_file.close()