from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region_info import (
    AlleleRegionInfoSerializer,
)


class AlleleRegionInfoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleRegionInfo.objects.all()
    
    serializer_class = AlleleRegionInfoSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = ["region__population", "allele__name"]
    filterset_fields= ["region", "allele"]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
