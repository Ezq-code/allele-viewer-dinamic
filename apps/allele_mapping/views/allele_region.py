from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.serializers.allele_region import AlleleRegionSerializer


class AlleleRegionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleRegion.objects.all()
    serializer_class = AlleleRegionSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = []
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
