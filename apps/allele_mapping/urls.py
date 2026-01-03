# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.allele_mapping.views.allele_mapping_files import AlleleMappingFilesViewSet
from apps.allele_mapping.views.allele_to_map import AlleleToMapViewSet
from apps.allele_mapping.views.allele_info import AlleleInfoViewSet


router = ExtendedSimpleRouter()

uploaded_files_router = router.register(
    "allele-mapping-files",
    AlleleMappingFilesViewSet,
    basename="allele-mapping-files",
)

alleles_router = router.register(
    "alleles-to-map",
    AlleleToMapViewSet,
    basename="alleles-to-map",
)

allele_info_router = router.register(
    "alleles-info",
    AlleleInfoViewSet,
    basename="alleles-info",
)


urlpatterns = []

urlpatterns += router.urls
