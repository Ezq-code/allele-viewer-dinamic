from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.serializers.gene_group_serializer import GeneGroupsSerializer
from apps.common.pagination import AllResultsSetPagination
from apps.business_app.serializers.minimal_serializers import GeneGroupMinimalSerializer
from rest_framework.decorators import action

from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneGroupsViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = GeneGroups.objects.all().prefetch_related("genes")

    # Usar el serializer diferente según la acción
    def get_serializer_class(self):
        if self.action == "minimal_list":
            return GeneGroupMinimalSerializer
        return GeneGroupsSerializer

    search_fields = [
        "name",
        "description",
        "genes__name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Endpoint reducido
    @action(
        detail=False,
        methods=["GET"],
        url_path="minimal-list",
        url_name="minimal-list",
    )
    def minimal_list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
