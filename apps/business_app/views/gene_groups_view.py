from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.serializers.gene_group_serializer import GeneGroupsSerializer
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneGroupsViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = GeneGroups.objects.all().prefetch_related("genes")

    serializer_class = GeneGroupsSerializer
    search_fields = [
        "name",
        "description",
        "genes_name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
