from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region_info import (
    AlleleRegionInfoSerializer,
    AlleleRegionInfoWithRegionSerializer,
)


class AlleleRegionInfoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleRegionInfo.objects.all()
    serializer_class = AlleleRegionInfoSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = ["region__population", "allele__name"]
    filterset_fields = ["region", "allele"]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos
    @action(detail=False, methods=["get"], url_path="by-region")
    def by_region(self, request):
        """
        Endpoint para obtener alelos de una región específica
        Parámetros:
        - region_id (ID numérico) o population (nombre de población) - REQUERIDO
        - gene_id (ID del gen) o gene_name (nombre del gen) - OPCIONAL
        """
        region_id = request.query_params.get("region_id")
        population = request.query_params.get("population")
        gene_id = request.query_params.get("gene_id")
        gene_name = request.query_params.get("gene_name")

        if not region_id and not population:
            return Response(
                {"error": "You must provide region_id or population"}, status=400
            )

        queryset = AlleleRegionInfo.objects.filter(
            allele_frequency__isnull=False, allele_frequency__gt=0
        ).select_related("allele", "allele__gene", "region")

        # filtro de región según parámetro recibido
        if region_id:
            queryset = queryset.filter(region_id=region_id)
        elif population:
            queryset = queryset.filter(region__population__icontains=population)

        # Filtro por gen (si se proporciona)
        if gene_id:
            queryset = queryset.filter(allele__gene_id=gene_id)
        elif gene_name:
            queryset = queryset.filter(allele__gene__name__icontains=gene_name)
        queryset = queryset.order_by('-allele_frequency')
        serializer = AlleleRegionInfoWithRegionSerializer(queryset, many=True)
        return Response(serializer.data)
