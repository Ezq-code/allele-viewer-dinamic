# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.genes_to_excel.views import (

    UploadedFilesViewSet,

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

urlpatterns += router.urls
