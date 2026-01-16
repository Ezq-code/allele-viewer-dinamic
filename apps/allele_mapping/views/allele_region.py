from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch, OuterRef

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region import (
    AlleleRegionSerializer,
    AlleleRegionWithAllelesSerializer,
)
from apps.allele_mapping.filters.allele_region import AlleleRegionFilter
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


class AlleleRegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleRegion.objects.prefetch_related(
        Prefetch(
            "alleles",
            queryset=AlleleRegionInfo.objects.filter(
                percent_of_individuals__isnull=False,
                percent_of_individuals__gt=0,
            ).select_related("allele", "allele__gene"),
            to_attr="filtered_alleles"  # Usado en el serializer
        )
    )
    serializer_class = AlleleRegionWithAllelesSerializer
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = ("alleles__allele__gene__name", "population", "location")
    filterset_class = AlleleRegionFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # @method_decorator(cache_page(timeout=None)) 
    def list(self, request, *args, **kwargs):
        """
        Lista todos los AlleleRegion con filtros aplicados
        """
        return super().list(request, *args, **kwargs)

    # @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos
    # @action(detail=False, methods=['get'], url_path='with-allele-info')
    # def with_allele_info(self, request):
    #     """
    #     Endpoint PAGINADO para todas las regiones con sus alelos
    #     """
    #     # se agrega filtro por sample_size aquí si fuera necesario
    #     min_sample_size = request.query_params.get('min_sample_size')
    #     max_sample_size = request.query_params.get('max_sample_size')

    #     regions = AlleleRegion.objects.filter(
    #         alleles__allele_frequency__isnull=False
    #     ).exclude(
    #         alleles__allele_frequency=0
    #     ).distinct()

    #     # filtro por sample_size si se proporciona
    #     if min_sample_size or max_sample_size:
    #         # filtro para allele_info
    #         allele_filter = Q(allele_frequency__isnull=False) & ~Q(allele_frequency=0)

    #         if min_sample_size:
    #             allele_filter &= Q(sample_size__gte=int(min_sample_size))
    #         if max_sample_size:
    #             allele_filter &= Q(sample_size__lte=int(max_sample_size))

    #         # Filtrar regiones que tienen alelos que cumplen el filtro
    #         region_ids = AlleleRegionInfo.objects.filter(
    #             allele_filter
    #         ).values_list('region_id', flat=True).distinct()

    #         regions = regions.filter(id__in=region_ids)

    #     # Prefetch relacionado
    #     regions = regions.prefetch_related(
    #         Prefetch(
    #             'alleles',
    #             queryset=AlleleRegionInfo.objects.filter(
    #                 allele_frequency__isnull=False
    #             ).exclude(
    #                 allele_frequency=0
    #             ).select_related('allele', 'allele__gene'),
    #             to_attr='filtered_alleles'
    #         )
    #     )

    #     serializer = AlleleRegionWithAllelesSerializer(regions, many=True)
    #     return Response(serializer.data)

    @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos
    @action(detail=False, methods=["get"], url_path="by-gene")
    def by_gene(self, request):
        """
        Endpoint con filtros:
        - gene_id o gene_name (REQUERIDO)
        - min_sample_size (OPCIONAL): límite inferior del rango
        - max_sample_size (OPCIONAL): límite superior del rango
        """
        gene_id = request.query_params.get("gene_id")
        gene_name = request.query_params.get("gene_name")
        min_sample_size = request.query_params.get("min_sample_size")
        max_sample_size = request.query_params.get("max_sample_size")

        if not gene_id and not gene_name:
            return Response(
                {"error": "You must provide gene_id or gene_name"}, status=400
            )

        # filtro base para allele_info
        allele_info_filter = Q(allele_frequency__isnull=False, allele_frequency__gt=0)

        # filtro por gen
        if gene_id:
            allele_info_filter &= Q(allele__gene_id=gene_id)
        elif gene_name:
            allele_info_filter &= Q(allele__gene__name__icontains=gene_name)

        # filtro por rango de sample_size si se proporciona
        if min_sample_size:
            try:
                min_sample_size = int(min_sample_size)
                allele_info_filter &= Q(sample_size__gte=min_sample_size)
            except ValueError:
                return Response(
                    {"error": "min_sample_size must be an integer"}, status=400
                )
        if max_sample_size:
            try:
                max_sample_size = int(max_sample_size)
                allele_info_filter &= Q(sample_size__lte=max_sample_size)
            except ValueError:
                return Response(
                    {"error": "max_sample_size must be an integer"}, status=400
                )

        # Validar que min no sea mayor que max
        if min_sample_size and max_sample_size and min_sample_size > max_sample_size:
            return Response(
                {"error": "min_sample_size cannot be greater than max_sample_size"},
                status=400,
            )

        # Obtener solo los IDs de regiones que tienen al menos un alelo que cumple el filtro
        region_ids = (
            AlleleRegionInfo.objects.filter(allele_info_filter)
            .values_list("region_id", flat=True)
            .distinct()
        )

        # Si no hay regiones que cumplan, devolver vacío inmediatamente
        if not region_ids:
            return Response([])

        # Obtener las regiones con prefetch, aplicando el mismo filtro a los alelos
        regions = AlleleRegion.objects.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=AlleleRegionInfo.objects.filter(
                    allele_info_filter
                ).select_related("allele", "allele__gene"),
                to_attr="filtered_alleles",
            )
        )

        serializer = AlleleRegionWithAllelesSerializer(regions, many=True)
        return Response(serializer.data)
