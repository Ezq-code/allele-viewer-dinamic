# from rest_framework import routers

# from rest_framework_extensions.routers import ExtendedSimpleRouter

from django.urls import path
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.genes_to_excel.views import (
    genview,
    uploadexcelview,
    admin_views,
)
from apps.genes_to_excel.views.caracteristica_gen import CaracteristicaGenViewSet
from apps.genes_to_excel.views.coordenadas_gen import CoordenadasGenViewSet

router = ExtendedSimpleRouter()

# uploaded_files_router = router.register("uploaded-files",UploadedFilesViewSet, basename="uploaded-files",)
router.register(
    "caracteristica-gen", CaracteristicaGenViewSet, basename="caracteristica-gen"
)
router.register(
    "coordenadas-gen", CoordenadasGenViewSet, basename="coordenadas-gen"
)
urlpatterns = [
    path(
        "v1/admin/clear-all-data/",
        admin_views.ClearAppDataView.as_view(),
        name="clear-all-data",
    ),
    path("v1/listgenes", genview.GenListView.as_view(), name="list-genes"),
    path(
        "v1/upload_excel_file",
        uploadexcelview.UploadExcelView.as_view(),
        name="upload-excel-file",
    )
]

urlpatterns += router.urls
