import logging

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from model_bakery import baker

from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.custom_generated_pdb_files import CustomGeneratedPdbFiles
from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.working_copy_of_original_file import (
    WorkingCopyOfOriginalFile,
)
from apps.business_app.utils.excel_nomenclators import ExcelNomenclators
from apps.business_app.utils.google_api_coordinator import GoogleApiCoordinator
from apps.business_app.utils.upload_to_google_drive_api import UploadToGoogleDriveApi
from project_site import settings
from apps.users_app.models.system_user import SystemUser

logger = logging.getLogger(__name__)


class GoogleSheetCoordinateProcessor(GoogleApiCoordinator):
    def __init__(self, uploaded_file, user) -> None:
        super().__init__(scope=["https://www.googleapis.com/auth/spreadsheets"])
        self.sheet_service = build("sheets", "v4", credentials=self.creds)
        # Call the Sheets API
        self.sheet = self.sheet_service.spreadsheets()
        self.drive_processor = UploadToGoogleDriveApi()
        self.uploaded_file = uploaded_file

        # original_pdb_file_path = (
        #     PdbFiles.objects.filter(original_file_id=uploaded_file.id).first().file.path
        # )
        self.working_files = None
        try:
            self.working_files = WorkingCopyOfOriginalFile.objects.get(
                uploaded_file=uploaded_file, system_user_id=user.id
            )
            created = False
        except WorkingCopyOfOriginalFile.DoesNotExist:
            self.working_files = WorkingCopyOfOriginalFile.objects.create(
                uploaded_file=uploaded_file, system_user_id=user.id
            )
            created = True
        except Exception as e:
            logger.error(f"Error creating WorkingCopyOfOriginalFile object: {e}")
            raise e from e
        try:
            if not self.working_files.google_sheet_id_copy:
                self.working_files.google_sheet_id_copy = (
                    self.drive_processor.copy_google_drive_file(
                        remote_file_id=uploaded_file.google_sheet_id
                    )
                )
                self.working_files.save(update_fields=["google_sheet_id_copy"])
            self.working_files_status_is_created = created
        except Exception as e:
            logger.error(f"Error creating WorkingCopyOfOriginalFile object: {e}")
            raise e from e

    def _format_coordinate(self, coordinate_string):
        try:
            value = (
                coordinate_string.strip()
                .replace(",", ".")
                .replace("(", "-")
                .replace(")", "")
            )
            return int(value)
        except Exception as e:
            logger.error(f"Error formatting coordinate: {e}")
            return 0

    def _write_tmp_pdb_file(self, updated_lines):
        file_name = baker.random_gen.gen_string(10)
        random_tmp_pdb = f"{settings.MEDIA_ROOT}/{file_name}.pdb"
        with open(random_tmp_pdb, "w") as file:
            file.write("\n".join(updated_lines) + "\n")
        return file_name

    def _process_pdb_file(
        self,
        original_pdb_file,
        excel_values,
        number_column_index,
        x_column_index,
        y_column_index,
        z_column_index,
        line_kind_column_index,
    ):
        updated_lines = []
        with open(original_pdb_file, "r") as file:
            for line in file:
                atom_record = line.strip().split()
                if atom_record[line_kind_column_index] in ("CONECT", "END"):
                    updated_lines.append(line.strip())
                    continue
                updated_lines.append(
                    self._match_atom_record(
                        atom_record,
                        excel_values,
                        number_column_index,
                        x_column_index,
                        y_column_index,
                        z_column_index,
                    )
                )

        return updated_lines

    def _match_atom_record(
        self,
        atom_record,
        excel_values,
        number_column_index,
        x_column_index,
        y_column_index,
        z_column_index,
    ):
        for row in excel_values:
            if atom_record[1] == row[number_column_index]:
                x_string = self._format_coordinate(row[x_column_index])
                y_string = self._format_coordinate(row[y_column_index])
                z_string = self._format_coordinate(row[z_column_index])
                new_line = ExcelNomenclators._atom_record_format.format(
                    "ATOM",
                    int(atom_record[1]),
                    atom_record[2],
                    "",
                    "ALA",
                    "A",
                    1,
                    "",
                    x_string,
                    y_string,
                    z_string,
                    1.0,
                    0.0,
                    atom_record[2],
                    "",
                )
                excel_values.remove(row)
                return new_line
        return None

    def get_output(self):
        print("Getting output...")
        number_column_index = 0
        x_column_index = 7
        y_column_index = 8
        z_column_index = 9
        line_kind_column_index = 0
        existing_allele_nodes_qty = AlleleNode.objects.filter(
            uploaded_file=self.working_files.uploaded_file
        ).count()
        output_range = (
            f"{ExcelNomenclators.output_sheet}!A2:J{existing_allele_nodes_qty + 1}"
        )
        try:
            updated_lines = []

            result = (
                self.sheet.values()
                .get(
                    spreadsheetId=self.working_files.google_sheet_id_copy,
                    range=output_range,
                )
                .execute()
            )
            excel_values = result.get("values", [])
            if not excel_values:
                print("No data found.")
                return

            updated_lines = self._process_pdb_file(
                self.working_files.pdb_file_copy.file.path
                if self.working_files.pdb_file_copy
                else PdbFiles.objects.filter(original_file_id=self.uploaded_file.id)
                .first()
                .file.path,
                excel_values,
                number_column_index,
                x_column_index,
                y_column_index,
                z_column_index,
                line_kind_column_index,
            )
            file_name = self._write_tmp_pdb_file(updated_lines)
            if self.working_files.pdb_file_copy:
                self.working_files.pdb_file_copy.delete()

            custom_generated_pdb_file = CustomGeneratedPdbFiles.objects.create(
                file=file_name + ".pdb",
                original_file=self.uploaded_file,
                custom_name=file_name,
                system_user_id=self.working_files.system_user_id,
            )
            if (
                self.working_files.system_user.internal_status
                == SystemUser.INTERNAL_STATUS.PREMIUM
            ):
                self.working_files.pdb_file_copy = custom_generated_pdb_file
                self.working_files.save(update_fields=["pdb_file_copy"])
            else:
                self.working_files.delete()
            return custom_generated_pdb_file

        except HttpError as err:
            print(f"An HttpError occurred: {err}")
            if self.working_files_status_is_created:
                self.working_files.delete()
            print("Raising error...")
            raise err from err
        except Exception as err:
            print(f"An Exception occurred: {err}")
            if self.working_files_status_is_created:
                self.working_files.delete()
            print("Raising error...")
            raise err from err

    def recursive_realocate_numeric_values(self, numeric_value_set, numeric_value):
        if numeric_value in numeric_value_set:
            numeric_value += 0.01  # Increase the value slightly to avoid collision.
            return self.recursive_realocate_numeric_values(
                numeric_value_set, numeric_value
            )
        else:
            numeric_value_set.add(numeric_value)
            return numeric_value_set, numeric_value

    def proccess_snp_input(self, input_list):
        print("Processing SNP input...")
        try:
            input_column = f"{ExcelNomenclators.input_sheet}!C"
            input_data = []
            numeric_value_set = set()
            for element in input_list:
                initial_data_reference = element.get("initial_filedata_id")

                min_value = initial_data_reference.min_value
                max_value = initial_data_reference.max_value
                custom_percent = element.get("new_percent_value")
                numeric_value = min_value + (custom_percent / 100) * (
                    max_value - min_value
                )
                numeric_value = round(numeric_value, 2)
                numeric_value_set, numeric_value = (
                    self.recursive_realocate_numeric_values(
                        numeric_value_set, numeric_value
                    )
                )
                input_data.append(
                    {
                        "range": f"{input_column}{initial_data_reference.row_index}",
                        "values": [[numeric_value]],
                    }
                )

            if input_data:
                request_body = {"valueInputOption": "USER_ENTERED", "data": input_data}
                result = (
                    self.sheet_service.spreadsheets()
                    .values()
                    .batchUpdate(
                        spreadsheetId=self.working_files.google_sheet_id_copy,
                        body=request_body,
                    )
                    .execute()
                )

                return result.get("totalUpdatedCells")

        except HttpError as err:
            print(err)

    def proccess_expansion_input(self, x_value, y_value, z_value):
        print("Processing EXPANSION input...")
        input_x_column = f"{ExcelNomenclators.constants_sheet}!{ExcelNomenclators.x_expansion_column_name}"
        input_y_column = f"{ExcelNomenclators.constants_sheet}!{ExcelNomenclators.y_expansion_column_name}"
        input_z_column = f"{ExcelNomenclators.constants_sheet}!{ExcelNomenclators.z_expansion_column_name}"
        input_data = [
            {
                "range": f"{input_x_column}{ExcelNomenclators.xyz_expansion_row_index}",
                "values": [[x_value]],
            },
            {
                "range": f"{input_y_column}{ExcelNomenclators.xyz_expansion_row_index}",
                "values": [[y_value]],
            },
            {
                "range": f"{input_z_column}{ExcelNomenclators.xyz_expansion_row_index}",
                "values": [[z_value]],
            },
        ]
        request_body = {"valueInputOption": "USER_ENTERED", "data": input_data}
        result = (
            self.sheet_service.spreadsheets()
            .values()
            .batchUpdate(
                spreadsheetId=self.working_files.google_sheet_id_copy,
                body=request_body,
            )
            .execute()
        )
        return result.get("totalUpdatedCells")
