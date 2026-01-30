from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.business_app.models.gene import Gene
from apps.allele_mapping.serializers.allele_to_map import AlleleToMapSerializer

from rest_framework.decorators import action
from rest_framework.response import Response


class AlleleToMapViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleToMap
    """

    queryset = AlleleToMap.objects.all()
    serializer_class = AlleleToMapSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = [
        "name",
        "gene__name",
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
