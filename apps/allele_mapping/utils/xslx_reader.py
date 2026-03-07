import logging


from apps.allele_mapping.utils.excel_structure_validator import ExcelStructureValidator
from apps.business_app.models.gene import Gene
from apps.allele_mapping.utils.excel_nomenclators import ExcelNomenclators
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_coord import AlleleRegionCoord
import pandas as pd

logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

    @staticmethod
    def _normalize_column_name(column_name):
        column_name = str(column_name)
        if "." in column_name:
            base_name, suffix = column_name.rsplit(".", 1)
            if suffix.isdigit():
                return base_name
        return column_name

    def _get_coordinate_column_triplets(self, columns):
        location_column = ExcelNomenclators.location_column_name
        latitud_column = ExcelNomenclators.latitud_column_name
        longitud_column = ExcelNomenclators.longitud_column_name

        normalized_columns = [
            self._normalize_column_name(column_name) for column_name in columns
        ]

        triplets = []
        for index in range(len(normalized_columns) - 2):
            if (
                normalized_columns[index] == location_column
                and normalized_columns[index + 1] == latitud_column
                and normalized_columns[index + 2] == longitud_column
            ):
                triplets.append((index, index + 1, index + 2))
        return triplets

    @staticmethod
    def _normalize_cell_value(value):
        if pd.isna(value):
            return None
        if isinstance(value, str) and not value.strip():
            return None
        return value

    def proccess_file(self, uploaded_file_id):
        logger.info("Proccessing file data...")

        for sheet_name, df in self.sheets_data.items():
            if sheet_name not in self.sheet_names:
                logger.info(f"{sheet_name} not processed, no gene match...")
                continue
            logger.info(f"Processing sheet {sheet_name} ...")

            gene = Gene.objects.get(name=sheet_name)
            data_for_batch_create = []
            data_for_region_coords_batch_create = []
            coordinate_column_triplets = self._get_coordinate_column_triplets(df.columns)

            if not coordinate_column_triplets:
                logger.warning(
                    f"No coordinate triplets found for sheet {sheet_name}."
                )

            for _, row in df.iterrows():
                allele_frequency = row[ExcelNomenclators.allele_frequency_column_name]
                if pd.isna(allele_frequency) or not allele_frequency:
                    continue
                sample_size = row[ExcelNomenclators.sample_size_column_name]
                if pd.isna(sample_size) or not sample_size:
                    continue

                percent_of_individuals = row[
                    ExcelNomenclators.percent_of_individuals_column_name
                ]
                if pd.isna(percent_of_individuals) or not percent_of_individuals:
                    percent_of_individuals = None

                allele, _ = AlleleToMap.objects.get_or_create(
                    name=row[ExcelNomenclators.allele_column_name],
                    defaults={"gene": gene, "file_id": uploaded_file_id},
                )
                region, _ = AlleleRegion.objects.get_or_create(
                    population=row[ExcelNomenclators.population_column_name],
                )

                for (
                    location_idx,
                    latitud_idx,
                    longitud_idx,
                ) in coordinate_column_triplets:
                    location = self._normalize_cell_value(row.iloc[location_idx])
                    latitud = self._normalize_cell_value(row.iloc[latitud_idx])
                    longitud = self._normalize_cell_value(row.iloc[longitud_idx])

                    if location is None and latitud is None and longitud is None:
                        continue

                    data_for_region_coords_batch_create.append(
                        AlleleRegionCoord(
                            allele_region=region,
                            location=location,
                            lat=latitud,
                            lon=longitud,
                        )
                    )

                data_for_batch_create.append(
                    AlleleRegionInfo(
                        allele=allele,
                        region=region,
                        percent_of_individuals=percent_of_individuals,
                        allele_frequency=allele_frequency,
                        sample_size=sample_size,
                    )
                )
            logger.info("Inserting AlleleRegionInfo objects in batch")

            AlleleRegionInfo.objects.bulk_create(data_for_batch_create)

            if data_for_region_coords_batch_create:
                logger.info("Inserting AlleleRegionCoord objects in batch")
                AlleleRegionCoord.objects.bulk_create(data_for_region_coords_batch_create)

            logger.info("Insertions completed")
