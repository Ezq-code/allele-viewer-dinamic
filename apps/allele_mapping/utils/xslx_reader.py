import logging


from apps.allele_mapping.utils.excel_structure_validator import ExcelStructureValidator
from apps.business_app.models.gene import Gene
from apps.allele_mapping.utils.excel_nomenclators import ExcelNomenclators
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_region import AlleleRegion

logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

    def proccess_file(self, uploaded_file_id):
        print("Proccessing file data...")

        for sheet_name, df in self.sheets_data.items():
            gene = Gene.objects.get(name=sheet_name)
            data_for_batch_create = []
            for _, row in df.iterrows():
                allele, _ = AlleleToMap.objects.get_or_create(
                    name=row[ExcelNomenclators.allele_column_name],
                    defaults={"gene": gene, "file_id": uploaded_file_id},
                )
                region, _ = AlleleRegion.objects.get_or_create(
                    population=row[ExcelNomenclators.population_column_name],
                    defaults={
                        "location": row[ExcelNomenclators.location_column_name],
                        "lat": row[ExcelNomenclators.latitud_column_name],
                        "lon": row[ExcelNomenclators.longitud_column_name],
                    },
                )

                data_for_batch_create.append(
                    AlleleRegionInfo(
                        allele=allele,
                        region=region,
                        percent_of_individuals=row[
                            ExcelNomenclators.percent_of_individuals_column_name
                        ],
                        allele_frequency=row[
                            ExcelNomenclators.allele_frequency_column_name
                        ],
                        sample_size=row[ExcelNomenclators.sample_size_column_name],
                    )
                )
            AlleleRegionInfo.objects.bulk_create(data_for_batch_create)
