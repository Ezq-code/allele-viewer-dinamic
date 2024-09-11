import logging

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from model_bakery import baker
from apps.business_app.utils.google_api_coordinator import GoogleApiCoordinator

logger = logging.getLogger(__name__)


class UploadToGoogleDriveApi(GoogleApiCoordinator):
    def __init__(self) -> None:
        super().__init__(
            scope=[
                "https://www.googleapis.com/auth/drive",
            ]
        )
        self.drive_service = build("drive", "v3", credentials=self.creds)

    def upload_file_to_google_drive(self, file_path):
        print("Uploading local file to Google Drive...")
        # Nombre de la hoja de cálculo en Google Drive
        sheet_name = (
            baker.random_gen.gen_string(max_length=10) + ".gsheet"
        )  # 10 caracteres aleatorios + ".xlsx"

        # Crear una nueva hoja de cálculo en Google Drive
        file_metadata = {
            "name": sheet_name,
            "mimeType": "application/vnd.google-apps.spreadsheet",  # Mime type for Excel
            # "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # Mime type for Excel
        }

        # Upload the file
        media_body = MediaFileUpload(file_path, resumable=True)

        file = (
            self.drive_service.files()
            .create(body=file_metadata, media_body=media_body)
            .execute()
        )
        permission = {"type": "anyone", "role": "writer"}
        self.drive_service.permissions().create(
            fileId=file.get("id"), body=permission
        ).execute()

        print(f"File '{sheet_name}' uploaded successfully!")
        # Obtener el ID de la hoja de cálculo
        sheet_id = file.get("id")
        return sheet_id

    def copy_google_drive_file(self, remote_file_id):
        print("Copying file from Google Drive to Google Drive...")
        # Nombre de la hoja de cálculo en Google Drive
        sheet_name = (
            baker.random_gen.gen_string(max_length=10) + ".gsheet"
        )  # 10 caracteres aleatorios + ".xlsx"

        # Crea el cuerpo de la solicitud de copia
        body = {"parents": [], "name": sheet_name}

        # Ejecuta la solicitud de copia
        result = (
            self.drive_service.files().copy(fileId=remote_file_id, body=body).execute()
        )
        # * deshabilitado por seguridad, esto permite abrir los
        # *ficheros que se generan temporalmente desde el navegador

        # permission = {"type": "anyone", "role": "writer"}
        # self.drive_service.permissions().create(
        #     fileId=result["id"], body=permission
        # ).execute()

        return result["id"]  # Retorna el ID de la copia de la hoja de cálculo.

    def delete_file_from_google_drive(self, file_id):
        """Delete a file or folder in Google Drive by ID."""
        print("Deleting file from Google Drive...")
        try:
            self.drive_service.files().delete(fileId=file_id).execute()
            print(f"Successfully deleted file/folder with ID: {file_id}")
        except Exception as e:
            print(f"Error deleting file/folder with ID: {file_id}")
            print(f"Error details: {str(e)}")
