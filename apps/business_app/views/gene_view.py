from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response

from apps.business_app.models.gene import Gene
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.gene_serializer import (
    GeneGetAllInfoSerializer,
    GeneSerializer,
    GeneSimpleSerializer
)
from apps.common.pagination import AllResultsSetPagination
from rest_framework.decorators import action
from django.db.models import Exists, OuterRef
from ..filters.gene_filter import GeneFilter
from apps.allele_mapping.models.allele_to_map import AlleleToMap


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
        url_path="allelic-groups",
        url_name="allelic-groups",
    )
    def get_allelic_groups(self, request):
        """
        Endpoint para obtener los grupos alélicos únicos de un gen específico
        Parámetros: gene_name (REQUERIDO)
        """
        gene_name = request.query_params.get('gene_name')

        if not gene_name:
            return Response(
                {"error": "You must provide gene_name"},
                status=400
            )

        # Filtrar alelos del gen especificado
        alleles = AlleleToMap.objects.filter(
            gene__isnull=False
        )

        if gene_name:
            alleles = alleles.filter(gene__name__icontains=gene_name)

        # Obtener nombres únicos de alelos
        allele_names = alleles.values_list('name', flat=True).distinct()

        # Extraer grupos alélicos usando regex
        # Ejemplo: de "A*01:01" extraemos "A*01"
        allelic_groups = set()
        pattern = r'^([A-Za-z\*]+[\d]+[\w]*)'  # Capturar hasta el primer ':'

        for allele_name in allele_names:
            match = re.match(pattern, allele_name)
            if match:
                # Extraer el grupo alélico (sin el alelo específico)
                base_group = match.group(1)
                allelic_groups.add(base_group)

        # Convertir a lista ordenada
        sorted_groups = sorted(list(allelic_groups))

        return Response({
            "gene_name": gene_name,
            "allelic_groups": sorted_groups
        })