from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.gene import Gene
from rest_framework.viewsets import GenericViewSet
from apps.business_app.serializers.gene_serializer import (
    GeneGetAllInfoSerializer,
    GeneSerializer,
)
from apps.common.pagination import AllResultsSetPagination
from rest_framework.decorators import action


from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = (
        Gene.objects.exclude(name="")
        .all()
        .prefetch_related(
            "groups",
            "gene_status_list__gene_status",
            "disorders__disease_subgroup__disease_group",
        )
    )

    serializer_class = GeneSerializer
    search_fields = [
        "name",
        "description",
        "disorders__name",
        "groups__name",
    ]
    ordering = "-status"
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = ("status", "groups", "disorders")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(
        detail=False,
        methods=["GET"],
        url_path="get-all-info",
        url_name="get-all-info",
        serializer_class=GeneGetAllInfoSerializer,
    )
    def get_all_info(self, request):
        return self.list(request)
