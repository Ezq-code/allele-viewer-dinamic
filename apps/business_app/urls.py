# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.business_app.views import (
    AllowedExtensionsViewSet,
    SiteConfigurationViewSet,
    UploadedFilesViewSet,
    InitialFileDataViewSet,
    NewCoordinatesProcessorViewSet,
    PdbFileViewSet,
    FeatureViewSet,
    EventViewSet,
    MarkerViewSet,
    EventGalleryViewSet,
    LayerViewSet,
)
from apps.business_app.views.allele_full_family import AlleleFullFamilyViewSet
from apps.business_app.views.allele_nodes import AlleleNodeViewSet


from apps.business_app.views.event_type import EventTypeViewSet
from apps.business_app.views.initial_xyz_expansion_data import (
    InitialXyzExpansionDataViewSet,
)
from apps.business_app.views.region import RegionViewSet
from apps.business_app.views.working_copy_of_original_file import (
    WorkingCopyOfOriginalFileViewSet,
)

router = ExtendedSimpleRouter()
router.register(
    "allowed-extensions",
    AllowedExtensionsViewSet,
    basename="allowed-extensions",
)
router.register(
    "event-configurations",
    SiteConfigurationViewSet,
    basename="event-configurations",
)

router.register(
    "uploaded-files",
    UploadedFilesViewSet,
    basename="uploaded-files-nodes",
).register(
    "allele-node-by-uploaded-file",
    AlleleNodeViewSet,
    basename="allele-node-by-uploaded-file",
    parents_query_lookups=["uploaded_file"],
)


router.register(
    "uploaded-files",
    UploadedFilesViewSet,
    basename="uploaded-files-data",
).register(
    "initial-file-data",
    InitialFileDataViewSet,
    basename="initial-file-data",
    parents_query_lookups=["uploaded_file"],
)

router.register(
    "allele-nodes",
    AlleleNodeViewSet,
    basename="allele-nodes",
)
router.register(
    "xyz-expansion",
    InitialXyzExpansionDataViewSet,
    basename="xyz-expansion",
)
router.register(
    "new-coordinate-processor",
    NewCoordinatesProcessorViewSet,
    basename="new-coordinate-processor",
)
router.register(
    "working-copy-of-original-file-for-user",
    WorkingCopyOfOriginalFileViewSet,
    basename="working-copy-of-original-file-for-user",
)
router.register(
    "compute-graph-changes",
    PdbFileViewSet,
    basename="compute-graph-changes",
)
# router.register(
#     "extract-allele-parents-tree",
#     AlleleParentsViewSet,
#     basename="extract-allele-parents-tree",
# )
# router.register(
#     "extract-allele-descendant-tree",
#     AlleleDescendantsViewSet,
#     basename="extract-allele-descendant-tree",
# )
router.register(
    "extract-allele-full-family-tree",
    AlleleFullFamilyViewSet,
    basename="extract-allele-full-family-tree",
)
router.register(
    "regions",
    RegionViewSet,
    basename="regions",
)

router.register(
    "features",
    FeatureViewSet,
    basename="features",
)

router.register(
    "events",
    EventViewSet,
    basename="events",
)
router.register(
    "event-types",
    EventTypeViewSet,
    basename="event-types",
)
router.register(
    "markers",
    MarkerViewSet,
    basename="markers",
)
router.register(
    "event-gallery",
    EventGalleryViewSet,
    basename="event-gallery",
)
router.register(
    "layers",
    LayerViewSet,
    basename="layers",
)

urlpatterns = []

urlpatterns += router.urls
