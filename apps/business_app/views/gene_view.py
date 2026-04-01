from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response

from apps.business_app.models.gene import Gene
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.gene_serializer import (
    GeneGetAllInfoSerializer,
    GeneSerializer,
    GeneSimpleSerializer,
)
from apps.common.pagination import AllResultsSetPagination
from rest_framework.decorators import action
from django.db.models import Exists, OuterRef
from ..filters.gene_filter import GeneFilter
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

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
            "disorders",
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
    filterset_class = GeneFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Sobrescribir create y update para manejar relaciones M2M
    def perform_create(self, serializer):
        instance = serializer.save()
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        return instance

    @action(
        detail=False,
        methods=["GET"],
        url_path="get-all-info",
        url_name="get-all-info",
        serializer_class=GeneGetAllInfoSerializer,
    )
    def get_all_info(self, request):
        """
        Retrieve all genes with complete information.

        Returns a comprehensive list of all genes using GeneGetAllInfoSerializer,
        which includes detailed information about each gene.

        Returns:
            Response: List of genes with full details including groups, disorders,
                     and status information
        """
        return self.list(request)

    @action(
        detail=False,
        methods=["GET"],
        url_path="list-for-graph",
        url_name="list-for-graph",
        serializer_class=GeneSerializer,
    )
    def list_for_graph(self, request):
        """
        Retrieve genes that have associated uploaded files for graph visualization.

        This endpoint filters genes to only include those that have at least one
        uploaded file associated with them. Useful for generating graphs where
        only genes with data should be displayed.

        Returns:
            Response: List of genes that have uploaded files
        """
        return self.list(request)

    @action(
        detail=False,
        methods=["GET"],
        url_path="with-alleles-to-map",
        url_name="with-alleles-to-map",
    )
    def with_alleles_to_map(self, request):
        """
        Retrieve genes that have alleles in the AlleleToMap table.

        Filters genes to only include those that have at least one related
        AlleleToMap entry. Uses database EXISTS query for efficient filtering.

        Returns:
            Response: List of genes (using GeneSimpleSerializer) that have
                     alleles mapped
        """
        # Filter genes that have at least one AlleleToMap related
        queryset = self.get_queryset().filter(
            Exists(AlleleToMap.objects.filter(gene_id=OuterRef("pk")))
        )

        serializer = GeneSimpleSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["GET"],
        url_path="alleles-by-gene",
        url_name="alleles-by-gene",
    )
    @method_decorator(cache_page(timeout=None))
    def get_alleles_by_gene(self, request):
        """
        Retrieve the complete list of alleles for a specific gene.

        This endpoint returns all unique allele names associated with a given gene.
        The results are cached indefinitely for performance.

        Args:
            request: The HTTP request containing query parameters
                - gene_name (required): The name of the gene to retrieve alleles for

        Returns:
            Response: Object containing gene_name and sorted list of alleles
            Example:
            {
                "gene_name": "HLA-A",
                "alleles": ["A*01:01", "A*01:02", "A*02:01", ...]
            }

        Raises:
            HTTP_400_BAD_REQUEST: If gene_name parameter is not provided
        """
        gene_name = request.query_params.get("gene_name")

        if not gene_name:
            return Response({"error": "You must provide gene_name"}, status=400)

        # Filter alleles for the specified gene (exact match, not icontains)
        alleles_qs = (
            AlleleToMap.objects.filter(
                gene__name=gene_name  # Changed to exact match
            )
            .values_list("name", flat=True)
            .distinct()
        )

        # If no alleles, return empty list
        if not alleles_qs:
            return Response({"gene_name": gene_name, "alleles": []})

        # Convert to list and sort alphabetically
        allele_list = sorted(list(alleles_qs))

        return Response({"gene_name": gene_name, "alleles": allele_list})
