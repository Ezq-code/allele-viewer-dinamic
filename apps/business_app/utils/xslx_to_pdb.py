import io
import logging

import pandas as pd

from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.initial_file_data import InitialFileData
from apps.business_app.models.initial_xyz_expansion_data import InitialXyzExpansionData
from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.utils.excel_reader import ExcelNomenclators, ExcelReader
from django.db import transaction


logger = logging.getLogger(__name__)


class XslxToPdb(ExcelReader):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)
        self.input_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelNomenclators.input_sheet,
            engine="openpyxl",
        )
        self.constants_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelNomenclators.constants_sheet,
            engine="openpyxl",
        )
        self.input_mandatory_columns_for_validation = (
            ExcelNomenclators.input_original_value_column_name,
            ExcelNomenclators.input_min_value_column_name,
            ExcelNomenclators.input_max_value_column_name,
            ExcelNomenclators.input_allele_column_name,
            ExcelNomenclators.input_marker_column_name,
            ExcelNomenclators.input_column_to_change_value_column_name,
        )
        self._validate_input_sheet_file_structure()

    def _validate_input_sheet_file_structure(self):
        first_row_input = self.input_df.iloc[0]
        for column in self.input_mandatory_columns_for_validation:
            try:
                first_row_input[column]
            except KeyError as e:
                logger.error(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{ExcelNomenclators.input_sheet}' "
                    f"has at least the next column missing: {column}."
                )

    def proccess_initial_file_data(self, uploaded_file_id):
        print("Proccessing initial file data...")
        data = []
        for index, row in self.input_df.iterrows():
            data.append(
                InitialFileData(
                    allele=row[ExcelNomenclators.input_allele_column_name],
                    marker=row[ExcelNomenclators.input_marker_column_name],
                    min_value=row[ExcelNomenclators.input_min_value_column_name],
                    max_value=row[ExcelNomenclators.input_max_value_column_name],
                    original_value=int(
                        row[ExcelNomenclators.input_original_value_column_name]
                    ),
                    uploaded_file_id=uploaded_file_id,
                    row_index=index + 2,
                )
            )
        with transaction.atomic():
            InitialFileData.objects.bulk_create(data)
        info_row = 0
        x_column = 0
        y_column = 1
        z_column = 2
        x_value = self.constants_df.iat[info_row, x_column]
        y_value = self.constants_df.iat[info_row, y_column]
        z_value = self.constants_df.iat[info_row, z_column]
        InitialXyzExpansionData.objects.create(
            x_value=x_value,
            y_value=y_value,
            z_value=z_value,
            uploaded_file_id=uploaded_file_id,
        )

    def proccess_pdb_file(self, uploaded_file_id, pdb_filename_base):
        print("Proccessing PDB file...")
        allele_allele_number_pool = []
        try:
            pdb_files = [io.StringIO() for _ in range(self.coordinates_sets)]
            # Open the PDB file for writing
            allele_nodes = {}

            # atom_number = 0
            relations_for_the_end = {}
            element = None
            # Loop over each row in the Excel file
            for _, row in self.output_df.iterrows():
                symbol = row[ExcelNomenclators.output_symbol_column_name]
                allele = row[ExcelNomenclators.output_allele_column_name]
                region = row[ExcelNomenclators.output_region_column_name]
                timeline_appearence = row[ExcelNomenclators.timeline_appearence]
                if pd.isna(allele) or pd.isna(
                    row[ExcelNomenclators.output_number_column_name]
                ):
                    break
                allele_number = int(row[ExcelNomenclators.output_number_column_name])
                if allele_number in allele_allele_number_pool:
                    continue
                allele_allele_number_pool.append(allele_number)
                rs = row[ExcelNomenclators.output_rs_column_name]
                parents_info = row[ExcelNomenclators.output_parent_column_name]
                parents = []
                if not pd.isna(parents_info):
                    parents = (
                        int(parent.strip()) for parent in str(parents_info).split(",")
                    )
                for parent in parents:
                    if parent == allele_number:
                        continue
                    relations_for_the_end.setdefault(parent, []).append(allele_number)
                element = next(self.elements_symbol_iterator)

                # Write the atom record in the PDB file format
                current_coordinate_index = 0
                for memory_file in pdb_files:
                    memory_file.write(
                        ExcelNomenclators.get_atom_record_string(
                            allele_number=allele_number,
                            element=element,
                            x_coordinate=int(row[f"X{current_coordinate_index}"]),
                            y_coordinate=int(row[f"Y{current_coordinate_index}"]),
                            z_coordinate=int(row[f"Z{current_coordinate_index}"]),
                        )
                    )
                    memory_file.write("\n")
                    current_coordinate_index += 1
                allele_nodes[allele_number] = AlleleNode.objects.create(
                    element=element,
                    number=allele_number,
                    custom_element_name=allele,
                    symbol=symbol,
                    rs=rs,
                    uploaded_file_id=uploaded_file_id,
                    region=region,
                    timeline_appearence=timeline_appearence,
                    unique_number=f"{uploaded_file_id}-{allele_number}",
                )

            for k, v in relations_for_the_end.items():
                current_node = allele_nodes.get(k)
                if current_node and current_node.pk:
                    children_list = []
                    for value in v:
                        child = allele_nodes.get(value)
                        if child and child.pk:
                            children_list.append(child)
                            for memory_file in pdb_files:
                                memory_file.write(
                                    ExcelNomenclators.get_atom_connection_record_string(
                                        origin_index=k,
                                        destination_index=value,
                                    )
                                )
                                memory_file.write("\n")

                    for child in children_list:
                        current_node.children.add(child)
            index = 0
            for memory_file in pdb_files:
                memory_file.write("END")
                file_content = memory_file.getvalue()
                memory_file.close()
                self.create_pdb_and_persist_on_db(
                    file_content=file_content,
                    pdb_filename_base=pdb_filename_base,
                    suffix=f"excel_{index}",
                    uploaded_file_id=uploaded_file_id,
                    kind=PdbFiles.KIND.EXCEL_GENERATED,
                )
                index += 1

            # return pdb_file_0
        except Exception as e:
            AlleleNode.objects.filter(uploaded_file__isnull=True).delete()
            logger.error(f"An error occurred during file parsing: {e}")
            raise ValueError(f"An error occurred during file parsing: {e}.")
