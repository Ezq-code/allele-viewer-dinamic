from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_info import AlleleInfo
from apps.allele_mapping.serializers.allele_info import AlleleInfoSerializer


class AlleleInfoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleInfo.objects.all()
    serializer_class = AlleleInfoSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = [
        "population",
        "allele__name",
        "allele__gene__name",
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
