import logging
import sys
import pandas as pd

import itertools

from apps.business_app.models.pdb_files import PdbFiles
from apps.genes_to_excel.utils.excel_nomenclators import ExcelNomenclators

logger = logging.getLogger(__name__)


class ExcelStructureValidator:
    def __init__(self, origin_file) -> None:
        self.origin_file = origin_file
       

        self._output_mandatory_columns_for_validation = (
            ExcelNomenclators.gene_column_name,
            ExcelNomenclators.coord_column_name,
            ExcelNomenclators.valor_column_name,
            ExcelNomenclators.color_column_name,
        )
       
        self.df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelNomenclators.input_sheet,
            engine="openpyxl",
        )
        self._validate_sheet_file_structure()

    def _validate_sheet_file_structure(self):
        first_row_output = self.df.iloc[0]
        for column in self._output_mandatory_columns_for_validation:
            try:
                first_row_output[column]
            except KeyError as e:
                logger.error(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{ExcelNomenclators.output_sheet}' "
                    f"has at least the next column missing: {column}."
                ) from None