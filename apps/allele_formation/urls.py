# from rest_framework import routers
from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.allele_formation.views.allele_snp_info_viewset import AlleleSNPInfoViewSet


router = ExtendedSimpleRouter()

router.register(
    "allele-snp-info",
    AlleleSNPInfoViewSet,
    basename="allele-snp-info",
)

urlpatterns = []

urlpatterns += router.urls
