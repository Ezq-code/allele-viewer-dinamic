from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.gene import Gene
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.gene_serializer import (
    GeneGetAllInfoSerializer,
    GeneSerializer,
)
from apps.common.pagination import AllResultsSetPagination
from rest_framework.decorators import action
from django.db.models import Exists, OuterRef


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

    def get_queryset(self):
        queryset = super().get_queryset()
        print(self.action)
        if self.action == "list_for_graph":
            queryset = queryset.filter(
                Exists(UploadedFiles.objects.filter(gene_id=OuterRef("pk")))
            )
        return queryset

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

    @action(
        detail=False,
        methods=["GET"],
        url_path="list-for-graph",
        url_name="list-for-graph",
        serializer_class=GeneSerializer,
    )
    def list_for_graph(self, request):
        return self.list(request)
