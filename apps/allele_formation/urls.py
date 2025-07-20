# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.allele_formation.views.allele_snp_info_viewset import AlleleSNPInfoViewSet
from apps.allele_formation.views.snp_allele_location_formation import (
    SNPAlleleLocationFormationViewSet,
)
from apps.allele_formation.views.snp_allele_parents_formation import (
    SNPAlleleParentsFormationViewSet,
)


router = ExtendedSimpleRouter()

router.register(
    "allele-snp-info",
    AlleleSNPInfoViewSet,
    basename="allele-snp-info",
)
router.register(
    "snp-allele-location-formation",
    SNPAlleleLocationFormationViewSet,
    basename="snp-allele-location-formation",
)
router.register(
    "snp-allele-parents-formation",
    SNPAlleleParentsFormationViewSet,
    basename="snp-allele-parents-formation",
)

urlpatterns = []

urlpatterns += router.urls
