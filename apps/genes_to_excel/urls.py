# from rest_framework import routers

# from rest_framework_extensions.routers import ExtendedSimpleRouter

from django.urls import path, include
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.genes_to_excel.views.uploaded_files import (
    UploadedFilesViewSet,
)
from apps.genes_to_excel.views.uploadexcelview import UploadExcelView
from apps.genes_to_excel.views import (
    gendataview, genview,
    uploadexcelview, admin_views
)

router = ExtendedSimpleRouter()

#uploaded_files_router = router.register("uploaded-files",UploadedFilesViewSet, basename="uploaded-files",)

urlpatterns = [
    path('v1/admin/clear-all-data/', admin_views.ClearAppDataView.as_view(), name='clear-all-data'), 
    path('v1/listgenes', genview.GenListView.as_view(), name='list-genes'),
    path('v1/upload_excel_file', uploadexcelview.UploadExcelView.as_view(), name='upload-excel-file'),
    path('v1/get_table/<str:gene_code>/table/', gendataview.GetGenCharacteristicsView.as_view(), name='get-gen-table'),
    path('v1/get_table/<str:gene_code>/table_stream/', gendataview.GetGenCharacteristicsStreamingView.as_view(), name='get-gen-table-stream'), 
    path('v1/coordinate_values/<str:gene_code>/<str:cord>/', gendataview.CoordinateValuesView.as_view(), name='coordinate-values'),
]

urlpatterns += router.urls
