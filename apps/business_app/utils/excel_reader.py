import logging
import sys
import pandas as pd

import itertools

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.utils.excel_nomenclators_base import ExcelNomenclatorsBase

logger = logging.getLogger(__name__)


class ExcelReader:
    def __init__(self, origin_file, excel_nomenclator_class: None) -> None:
        self.origin_file = origin_file
        self.excel_nomenclator_class = excel_nomenclator_class or ExcelNomenclatorsBase
        _elements_symbol_pool = (
            "C",  # Gris
            "LI",  # Rojo
            "S",  # Amarillo
            "N",  # Azul
            "Ca",  # Gris oscuro
            "BE",  # Rosado
            "Mg",  # Verde brillante
            "NA",  # Azul fuerte
            "Au",  # Amarillo mostaza
            "Fe",  # Naranja
            "TA",  # Rosado
            "I"  # Violeta
            "B",  # Verde claro brillante
        )
        self.region_color_maping = {
            "AFR-EAS": "B",  # East-African
            "AFR-SWE": "Mg",  # South-West-African
            "AFR-NOR": "Mg",  # North-African
            "AFR-AMR": "Fe",  # African American/Afro-Caribbean
            "SSA": "B",  # Sub-Saharan African
            "CSA": "Au",  # Central/South-Asian
            "CA": "Fe",  # Central-Asian
            "SA": "S",  # South-Asian
            "EUR": "N",  # European
            "EAS": "Na",  # East Asian
            "NEA": "TA",  # Near Eastern
            "OCE": "I",  # Oceanian
            "AMR": "BE",  # American
            "LAT": "LI",  # Latino
        }
        self.default_value_if_no_region = "C"
        self.elements_symbol_iterator = itertools.cycle(_elements_symbol_pool)

        self._output_mandatory_columns_for_validation = (
            self.excel_nomenclator_class.output_allele_column_name,
            self.excel_nomenclator_class.output_number_column_name,
            self.excel_nomenclator_class.output_region_column_name,
            self.excel_nomenclator_class.output_rs_column_name,
            self.excel_nomenclator_class.output_parent_column_name,
            "X0",
            "Y0",
            "Z0",
        )
        self.coordinates_sets = 0

        self.ilu_search_criteria = "ILU"  # ? UNUSED
        # dataframes = pd.read_excel(self.origin_file, sheet_name=None, engine="openpyxl")

        self.output_df = pd.read_excel(
            self.origin_file,
            sheet_name=self.excel_nomenclator_class.output_sheet,
            engine="openpyxl",
        )
        # self.temp_df = pd.read_excel(
        #     self.origin_file, sheet_name=self.excel_nomenclator_class.tmp_sheet, engine="openpyxl"
        # )

        self._validate_output_sheet_file_structure()

    def _validate_input_sheet_file_structure(self):
        first_row_input = self.input_df.iloc[0]
        for column in self.input_mandatory_columns_for_validation:
            try:
                first_row_input[column]
            except KeyError as e:
                logger.exception(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{self.excel_nomenclator_class.input_sheet}' "
                    f"has at least the next column missing: {column}."
                ) from None

    def _validate_output_sheet_file_structure(self):
        first_row_output = self.output_df.iloc[0]
        for column in self._output_mandatory_columns_for_validation:
            try:
                first_row_output[column]
            except KeyError as e:
                logger.exception(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{self.excel_nomenclator_class.output_sheet}' "
                    f"has at least the next column missing: {column}."
                ) from None
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
        self, file_content, pdb_filename_base, suffix, study_id, kind
    ):
        custom_name = f"{pdb_filename_base}-{suffix}.pdb"
        PdbFiles.objects.create(
            custom_name=custom_name,
            description="",
            study_id=study_id,
            pdb_content=file_content,
            kind=kind,
        )
