from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.serializers.gene_status_serializer import GeneStatusSerializer
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneStatusViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = GeneStatus.objects.all()

    serializer_class = GeneStatusSerializer
    search_fields = [
        "name",
        "description",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
