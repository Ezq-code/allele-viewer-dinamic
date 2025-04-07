import logging

logger = logging.getLogger(__name__)


class ExcelNomenclators:
    _atom_record_format = "{:<6s}{:>5d} {:<4s}{:1s}{:<3s} {:1s}{:>4d}{:1s}   {:8d}{:8d}{:8d}{:6.2f}{:6.2f}          {:>2s}{:>2s}"
    _conect_record_format = "{:<6s}{:5d}{:5d}{:5d}{:5d}"
    output_allele_column_name = "Allele"
    output_number_column_name = "Numero"
    output_region_column_name = "Region"
    output_rs_column_name = "rs"
    output_parent_column_name = "Parent"
    age = "Age"
    origin_1 = "Origen1"
    origin_2 = "Origen2"

    input_original_value_column_name = "Original"
    input_min_value_column_name = "Min"
    input_max_value_column_name = "Max"
    input_allele_column_name = "Allele"
    input_marker_column_name = "Marker"
    input_column_to_change_value_column_name = "Test1"

    input_sheet = "InValues"
    output_sheet = "For3D"
    tmp_sheet = "Temp"
    constants_sheet = "Constants"

    x_expansion_column_name = "A"
    y_expansion_column_name = "B"
    z_expansion_column_name = "C"
    xyz_expansion_row_index = 2

    @classmethod
    def get_atom_record_string(
        cls, allele_number, element, x_coordinate, y_coordinate, z_coordinate
    ):
        return cls._atom_record_format.format(
            "ATOM",
            allele_number,
            element,
            "",
            "ALA",
            "A",
            1,
            "",
            x_coordinate,
            y_coordinate,
            z_coordinate,
            1.0,
            0.0,
            element,
            "",
        )

    @classmethod
    def get_atom_connection_record_string(
        cls, origin_index: int, destination_index: int
    ):
        return cls._conect_record_format.format(
            # Esto lo hizo correcto
            "CONECT",
            origin_index,
            destination_index,
            0,
            0,
        )
