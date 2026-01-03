# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter
from django.urls import path, include

from apps.genes_to_excel.views import (
    UploadedFilesViewSet,
    gendataview,
    genview,
    uploadexcelview,
    admin_views,
)

from apps.business_app.views.allele_full_family import AlleleFullFamilyViewSet
from apps.business_app.views.allele_nodes import AlleleNodeViewSet


from apps.business_app.views.disease_group_view import DiseaseGroupViewSet
from apps.business_app.views.disease_subgroup_view import DiseaseSubGroupViewSet
from apps.business_app.views.disorder_view import DisorderViewSet
from apps.business_app.views.event_type import EventTypeViewSet
from apps.business_app.views.gene_groups_view import GeneGroupsViewSet
from apps.business_app.views.gene_status_middle_view import GeneStatusMiddleViewSet
from apps.business_app.views.gene_status_view import GeneStatusViewSet
from apps.business_app.views.gene_view import GeneViewSet
from apps.business_app.views.initial_xyz_expansion_data import (
    InitialXyzExpansionDataViewSet,
)
from apps.business_app.views.region import RegionViewSet
from apps.business_app.views.working_copy_of_original_file import (
    WorkingCopyOfOriginalFileViewSet,
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
