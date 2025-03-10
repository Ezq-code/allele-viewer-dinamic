import logging
import os.path

from google.oauth2 import service_account
from googleapiclient.errors import HttpError


from project_site import settings

logger = logging.getLogger(__name__)


class GoogleApiCoordinator:
    def __init__(self, scope) -> None:
        self.SCOPES = scope
        try:
            credential_path = os.path.join(
                settings.BASE_DIR, settings.CREDENTIAL_FILE_NAME
            )
            self.creds = service_account.Credentials.from_service_account_file(
                credential_path
            )
        except HttpError as err:
            print(err)
