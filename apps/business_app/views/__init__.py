__all__ = [
    "AllowedExtensionsViewSet",
    "SiteConfigurationViewSet",
    "UploadedFilesViewSet",
    "InitialFileDataViewSet",
    "NewCoordinatesProcessorViewSet",
    "PdbFileViewSet",
]
from .allowed_extensions import AllowedExtensionsViewSet
from .site_configurations import SiteConfigurationViewSet
from .uploaded_files import UploadedFilesViewSet
from .initial_file_data import InitialFileDataViewSet
from .new_coordinate_processor import NewCoordinatesProcessorViewSet
from .pdb_files import PdbFileViewSet
