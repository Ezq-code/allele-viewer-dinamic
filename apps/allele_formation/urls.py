# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.allele_formation.views.allele_snp_info_viewset import AlleleSNPInfoViewSet
from apps.allele_formation.views.snp_allele_location_formation_viewset import (
    SNPAlleleLocationFormationViewSet,
)
from apps.allele_formation.views.snp_allele_ancester_formation_viewset import (
    SNPAlleleAncesterFormationViewSet,
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
    "snp-allele-ancester-formation",
    SNPAlleleAncesterFormationViewSet,
    basename="snp-allele-ancester-formation",
)

urlpatterns = []

urlpatterns += router.urls
