# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.genes_to_excel.views import (
    UploadedFilesViewSet,
)


router = ExtendedSimpleRouter()

uploaded_files_router = router.register(
    "uploaded-files",
    UploadedFilesViewSet,
    basename="uploaded-files",
)


urlpatterns = []

urlpatterns += router.urls
