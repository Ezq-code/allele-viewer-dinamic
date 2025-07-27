from rest_framework import viewsets, filters, permissions
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo

from django_filters.rest_framework import DjangoFilterBackend


from apps.allele_formation.serializers.allele_snp_info_serializer import (
    AlleleSNPInfoSerializer,
)
from apps.common.views import CommonOrderingFilter


class AlleleSNPInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AlleleSNPInfo.objects.prefetch_related(
        "ancester_formation", "location_formation"
    )
    serializer_class = AlleleSNPInfoSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = [
        "allele",
    ]
    ordering_fields = "__all__"
    permission_classes = [permissions.AllowAny]
