import logging


from apps.allele_mapping.utils.excel_structure_validator import ExcelStructureValidator
from apps.business_app.models.gene import Gene
from apps.allele_mapping.utils.excel_nomenclators import ExcelNomenclators
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_coord import AlleleRegionCoord
from apps.business_app.models.sub_country import SubCountry

import pandas as pd

logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

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
            for _, row in df.iterrows():
                percent_of_individuals = row[
                    ExcelNomenclators.percent_of_individuals_column_name
                ]
                if pd.isna(percent_of_individuals) or not percent_of_individuals:
                    percent_of_individuals = None
                allele_frequency = row[ExcelNomenclators.allele_frequency_column_name]
                if pd.isna(allele_frequency) or not allele_frequency:
                    continue
                sample_size = row[ExcelNomenclators.sample_size_column_name]
                if pd.isna(sample_size) or not sample_size:
                    continue

                allele, _ = AlleleToMap.objects.get_or_create(
                    name=row[ExcelNomenclators.allele_column_name],
                    defaults={"gene": gene, "file_id": uploaded_file_id},
                )
                sub_country_incoming_name = row[
                    ExcelNomenclators.subcountry_column_name
                ]
                subcountry = SubCountry.objects.filter(
                    name__iexact=sub_country_incoming_name.replace("-", " ").strip()
                ).first()

                region, _ = AlleleRegion.objects.get_or_create(
                    population=row[ExcelNomenclators.population_column_name],
                    defaults={
                        "sub_country": subcountry,
                        "sub_country_incoming_name": sub_country_incoming_name,
                    },
                )

                location = row[ExcelNomenclators.location_column_name]
                latitud = row[ExcelNomenclators.latitud_column_name]
                longitud = row[ExcelNomenclators.longitud_column_name]

                data_for_region_coords_batch_create.append(
                    AlleleRegionCoord(
                        allele_region=region,
                        location=location,
                        lat=latitud,
                        lon=longitud,
                    )
                )
                kind_of_info = row[ExcelNomenclators.primary_or_secondary_column_name]

                data_for_batch_create.append(
                    AlleleRegionInfo(
                        allele=allele,
                        region=region,
                        percent_of_individuals=percent_of_individuals,
                        allele_frequency=allele_frequency,
                        sample_size=sample_size,
                        kind_of_info=kind_of_info[0],  # the initial
                    )
                )
            logger.info("Inserting AlleleRegionInfo objects in batch")

            AlleleRegionInfo.objects.bulk_create(data_for_batch_create)

            if data_for_region_coords_batch_create:
                logger.info("Inserting AlleleRegionCoord objects in batch")
                AlleleRegionCoord.objects.bulk_create(
                    data_for_region_coords_batch_create, ignore_conflicts=True
                )
            logger.info("Insertions completed")
