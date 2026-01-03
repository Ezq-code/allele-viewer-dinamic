# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter
from django.urls import path

from apps.genes_to_excel.views import (
    UploadedFilesViewSet,
    gendataview,
    genview,
    uploadexcelview,
    admin_views,
)




router = ExtendedSimpleRouter()

uploaded_files_router = router.register(
    "uploaded-files",
    UploadedFilesViewSet,
    basename="uploaded-files",
)

urlpatterns = []

# Estos urls Niobel los necesita
urlpatterns = [
    path(
        "admin/clear-all-data/",
        admin_views.ClearAppDataView.as_view(),
        name="clear-all-data",
    ),
    path("v1/listgenes", genview.GenListView.as_view(), name="list-genes"),
    path(
        "v1/upload_excel",
        uploadexcelview.UploadExcelView.as_view(),
        name="upload-excel",
    ),
    path(
        "v1/get_table/<str:gene_code>/table/",
        gendataview.GetGenCharacteristicsView.as_view(),
        name="get-gen-table",
    ),
    path(
        "v1/get_table/<str:gene_code>/table_stream/",
        gendataview.GetGenCharacteristicsStreamingView.as_view(),
        name="get-gen-table-stream",
    ),
    path(
        "v1/coordinate_values/<str:gene_code>/<str:cord>/",
        gendataview.CoordinateValuesView.as_view(),
        name="coordinate-values",
    ),
]

urlpatterns += router.urls
