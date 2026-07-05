import logging
import pandas as pd


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
            ExcelNomenclators.protein_column_name,
            ExcelNomenclators.alleleasoc_column_name,
            ExcelNomenclators.species_column_name,
            ExcelNomenclators.variant_column_name,
            ExcelNomenclators.order_1_column_name,
            ExcelNomenclators.order_2_column_name,
            ExcelNomenclators.order_3_column_name,
            ExcelNomenclators.ncbi_link_column_name,
        )

        self.df = self._load_dataframe()
        self._validate_sheet_file_structure()

    def _load_dataframe(self):
        """Load and concatenate all sheets from the Excel file."""
        excel_file = pd.ExcelFile(self.origin_file)
        all_dfs = [
            pd.read_excel(excel_file, sheet_name=sheet_name)
            for sheet_name in excel_file.sheet_names
        ]

        if not all_dfs:
            return pd.DataFrame()

        return pd.concat(all_dfs, ignore_index=True)

    def _validate_sheet_file_structure(self):
        first_row_output = self.df.iloc[0]
        for column in self._output_mandatory_columns_for_validation:
            try:
                first_row_output[column]
            except KeyError as e:
                logger.exception(e)
                raise ValueError(
                    f"Invalid file structure, at least the next column is missing: {column}."
                ) from None
