import logging
import pandas as pd


from apps.allele_mapping.utils.excel_nomenclators import ExcelNomenclators
from apps.business_app.models.gene import Gene

logger = logging.getLogger(__name__)


class ExcelStructureValidator:
    def __init__(self, origin_file) -> None:
        self.origin_file = origin_file

        # Lista de columnas que deben existir en todas las hojas
        self._output_mandatory_columns_for_validation = (
            ExcelNomenclators.allele_column_name,
            ExcelNomenclators.percent_of_individuals_column_name,
            ExcelNomenclators.allele_frequency_column_name,
            ExcelNomenclators.sample_size_column_name,
            ExcelNomenclators.location_column_name,
            ExcelNomenclators.latitud_column_name,
            ExcelNomenclators.longitud_column_name,
        )

        # 1. Leer todas las hojas del archivo Excel
        self.sheets_data = pd.read_excel(
            self.origin_file,
            sheet_name=None,  # <-- Clave: Leer todas las hojas
            engine="openpyxl",
        )

        # 2. Guardar la lista de nombres de las hojas
        self.sheet_names = list(self.sheets_data.keys())

        # 3. Validar la estructura de todas las hojas
        self._validate_all_sheets_structure()

    def _validate_all_sheets_structure(self):
        """Valida que todas las hojas del Excel tengan la misma estructura de columnas."""
        logger.info(
            f"Validando estructura de {len(self.sheet_names)} hojas: {self.sheet_names}"
        )

        for sheet_name, df in self.sheets_data.items():
            logger.info(f"Validando hoja: '{sheet_name}'")
            if not Gene.objects.filter(name=sheet_name).exists():
                logger.error(f"La hoja '{sheet_name}' no corresponde a un gen válido.")
                raise ValueError(
                    f"Estructura de archivo inválida. La hoja '{sheet_name}' "
                    "no corresponde a un gen válido."
                )
            first_row = df.iloc[0]

            for column in self._output_mandatory_columns_for_validation:
                try:
                    # Intenta acceder a la columna en la primera fila
                    first_row[column]
                except KeyError:
                    logger.error(
                        f"Error en la hoja '{sheet_name}': Columna '{column}' no encontrada."
                    )
                    raise ValueError(
                        f"Estructura de archivo inválida. La hoja '{sheet_name}' "
                        f"le falta la siguiente columna: '{column}'."
                    ) from None
        logger.info("Todas las hojas han pasado la validación de estructura.")
