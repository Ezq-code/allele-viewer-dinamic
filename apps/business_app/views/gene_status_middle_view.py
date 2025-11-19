from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.serializers.gene_status_middle_serializer import (
    GeneStatusMiddleReadSerializer,
)
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneStatusMiddleViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = GeneStatusMiddle.objects.all()

    serializer_class = GeneStatusMiddleReadSerializer
    search_fields = [
        "gene__name",
        "gene_status__name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
