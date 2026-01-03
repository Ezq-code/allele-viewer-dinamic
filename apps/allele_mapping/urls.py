# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.allele_mapping.views.allele_mapping_files import AlleleMappingFilesViewSet
from apps.allele_mapping.views.allele_to_map import AlleleToMapViewSet
from apps.allele_mapping.views.allele_region import AlleleRegionViewSet
from apps.allele_mapping.views.allele_region_info import AlleleRegionInfoViewSet


router = ExtendedSimpleRouter()

uploaded_files_router = router.register(
    "allele-mapping-files",
    AlleleMappingFilesViewSet,
    basename="allele-mapping-files",
)

router.register(
    "alleles-to-map",
    AlleleToMapViewSet,
    basename="alleles-to-map",
)

router.register(
    "alleles-region",
    AlleleRegionViewSet,
    basename="alleles-region",
)

router.register(
    "alleles-region-info",
    AlleleRegionInfoViewSet,
    basename="alleles-region-info",
)


urlpatterns = []

urlpatterns += router.urls
