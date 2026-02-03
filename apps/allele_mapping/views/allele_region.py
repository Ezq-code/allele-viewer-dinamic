from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from apps.common.pagination import AllResultsSetPagination
from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region import (
    AlleleRegionWithAllelesSerializer,
)
from apps.allele_mapping.filters.allele_region_filter import AlleleRegionFilter
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


class AlleleRegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    pagination_class = AllResultsSetPagination
    queryset = AlleleRegion.objects.prefetch_related("alleles", "alleles__allele__gene")
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

    @method_decorator(cache_page(timeout=None))
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

    @method_decorator(cache_page(timeout=None))
    @action(detail=False, methods=["get"], url_path="by-gene")
    def by_gene(self, request):
        """
        Endpoint optimizado con filtros:
        - allelic_group (REQUERIDO): Grupo alélico (ej: "A*01", "B*15")
        - min_sample_size (OPCIONAL): límite inferior del rango
        - max_sample_size (OPCIONAL): límite superior del rango
        """
        # gene_id = request.query_params.get('gene_id')
        # gene_name = request.query_params.get('gene_name')
        allelic_group = request.query_params.get("allelic_group")
        min_sample_size = request.query_params.get("min_sample_size")
        max_sample_size = request.query_params.get("max_sample_size")

        if not allelic_group:
            return Response({"error": "You must provide allelic_group"}, status=400)

        # Construir el filtro base para allele_info
        allele_info_filter = Q(allele_frequency__isnull=False, allele_frequency__gt=0)

        # Agregar filtro por grupo alélico si se proporciona
        if allelic_group:
            # Asegurarnos de que el grupo alélico tenga el formato correcto
            # Puede venir como "A*01" o "A*01:*" - normalizamos
            if ":" not in allelic_group:
                # Si no tiene ":", buscamos alelos que comiencen con ese grupo
                allele_info_filter &= Q(allele__name__startswith=allelic_group + ":")
            else:
                # Si ya tiene ":", buscamos exactamente ese grupo
                allele_info_filter &= Q(allele__name__startswith=allelic_group)

        # Agregar filtro por rango de sample_size si se proporciona
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
                queryset=AlleleRegionInfo.objects.filter(allele_info_filter)
                .select_related("allele", "allele__gene")
                .order_by("-allele_frequency"),
                to_attr="filtered_alleles",
            )
        )

        serializer = AlleleRegionWithAllelesSerializer(regions, many=True)
        return Response(serializer.data)
