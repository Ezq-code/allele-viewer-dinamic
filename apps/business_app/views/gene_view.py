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
import re


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

    @action(
        detail=False,
        methods=["GET"],
        url_path="with-alleles-to-map",
        url_name="with-alleles-to-map",
    )
    def with_alleles_to_map(self, request):
        """
        Endpoint para obtener genes que tienen alelos en la tabla AlleleToMap
        """
        # Filtrar genes que tienen al menos un AlleleToMap relacionado
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
        DEVUELVE LA LISTA COMPLETA DE ALELOS DE UN GEN ESPECÍFICO.
        Parámetros: gene_name (REQUERIDO)
        Retorna:
        {
            "gene_name": "HLA-A",
            "alleles": ["A*01:01", "A*01:02", "A*02:01", ...]
        }
        """
        gene_name = request.query_params.get("gene_name")

        if not gene_name:
            return Response({"error": "You must provide gene_name"}, status=400)

        # Filtrar alelos del gen especificado (búsqueda exacta, no icontains)
        alleles_qs = (
            AlleleToMap.objects.filter(
                gene__name=gene_name  # Cambiado a búsqueda exacta
            )
            .values_list("name", flat=True)
            .distinct()
        )

        # Si no hay alelos, devolver lista vacía
        if not alleles_qs:
            return Response({"gene_name": gene_name, "alleles": []})

        # Convertir a lista y ordenar alfabéticamente
        allele_list = sorted(list(alleles_qs))

        return Response({"gene_name": gene_name, "alleles": allele_list})
