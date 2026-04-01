from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from django.db.models import Prefetch
from apps.common.pagination import AllResultsSetPagination
from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo

from apps.allele_mapping.serializers.allele_region import (
    AlleleRegionWithAllelesSerializer,
)
from apps.allele_mapping.filters.allele_region_filter import AlleleRegionFilter
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


class AlleleRegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    pagination_class = AllResultsSetPagination
    queryset = AlleleRegion.objects.select_related(
        "sub_country__country"
    ).prefetch_related(
        Prefetch(
            "alleles",
            queryset=AlleleRegionInfo.objects.filter(
                allele_frequency__gt=0, sample_size__gt=0
            )
            .select_related("allele", "allele__gene")
            .order_by("-allele_frequency"),
        ),
        "alleles__allele__gene",
        "coordinates",
    )
    serializer_class = AlleleRegionWithAllelesSerializer
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = ("alleles__allele__gene__name", "population", "location")
    filterset_class = AlleleRegionFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @method_decorator(cache_page(timeout=None))
    def list(self, request, *args, **kwargs):
        """
        Lista todos los AlleleRegion con filtros aplicados
        """
        return super().list(request, *args, **kwargs)
