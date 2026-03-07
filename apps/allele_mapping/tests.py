from unittest.mock import patch

import pandas as pd

from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.utils.excel_nomenclators import ExcelNomenclators
from apps.allele_mapping.utils.xslx_reader import XslxReader
from apps.business_app.models.gene import Gene


def test_xslx_reader_creates_coords_for_repeated_coordinate_columns():
	columns = [
		ExcelNomenclators.allele_column_name,
		ExcelNomenclators.percent_of_individuals_column_name,
		ExcelNomenclators.allele_frequency_column_name,
		ExcelNomenclators.sample_size_column_name,
		ExcelNomenclators.population_column_name,
		ExcelNomenclators.location_column_name,
		ExcelNomenclators.latitud_column_name,
		ExcelNomenclators.longitud_column_name,
		f"{ExcelNomenclators.location_column_name}.1",
		f"{ExcelNomenclators.latitud_column_name}.1",
		f"{ExcelNomenclators.longitud_column_name}.1",
	]

	row = [
		"A*01",
		42.0,
		0.12,
		120,
		"Cuba",
		"La Habana",
		23.1136,
		-82.3666,
		"Pinar del Rio",
		22.417,
		-83.698,
	]
	df = pd.DataFrame([row], columns=columns)

	reader = object.__new__(XslxReader)
	reader.sheets_data = {"HLA-A": df}
	reader.sheet_names = ["HLA-A"]

	gene = Gene(name="HLA-A")
	allele = AlleleToMap(name="A*01", gene=gene)
	region = AlleleRegion(population="Cuba")

	with (
		patch(
			"apps.allele_mapping.utils.xslx_reader.Gene.objects.get",
			return_value=gene,
		),
		patch(
			"apps.allele_mapping.utils.xslx_reader.AlleleToMap.objects.get_or_create",
			return_value=(allele, True),
		),
		patch(
			"apps.allele_mapping.utils.xslx_reader.AlleleRegion.objects.get_or_create",
			return_value=(region, True),
		),
		patch("apps.allele_mapping.utils.xslx_reader.AlleleRegionInfo.objects.bulk_create") as bulk_info,
		patch("apps.allele_mapping.utils.xslx_reader.AlleleRegionCoord.objects.bulk_create") as bulk_coords,
	):
		reader.proccess_file(uploaded_file_id=1)

	bulk_info.assert_called_once()
	bulk_coords.assert_called_once()

	coords_to_create = bulk_coords.call_args.args[0]
	assert len(coords_to_create) == 2

	assert coords_to_create[0].allele_region == region
	assert coords_to_create[0].location == "La Habana"
	assert coords_to_create[0].lat == 23.1136
	assert coords_to_create[0].lon == -82.3666

	assert coords_to_create[1].allele_region == region
	assert coords_to_create[1].location == "Pinar del Rio"
	assert coords_to_create[1].lat == 22.417
	assert coords_to_create[1].lon == -83.698
