from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region import (
    AlleleRegionSerializer,
    AlleleRegionWithAllelesSerializer,
)


class AlleleRegionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleInfo
    """

    queryset = AlleleRegion.objects.all()
    serializer_class = AlleleRegionSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = ["location", "population"]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=["get"], url_path="with-allele-info")
    def with_allele_info(self, request):
        regions = (
            AlleleRegion.objects.prefetch_related(
                Prefetch(
                    "alleles",
                    queryset=AlleleRegionInfo.objects.filter(
                        allele_frequency__isnull=False
                    )
                    .exclude(allele_frequency=0)
                    .select_related("allele", "allele__gene"),
                )
            )
            .filter(alleles__allele_frequency__isnull=False)
            .exclude(alleles__allele_frequency=0)
            .distinct()
        )

        serializer = AlleleRegionWithAllelesSerializer(regions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-gene")
    def by_gene(self, request):
        """
        filtro por gen
        """
        gene_id = request.query_params.get("gene_id")
        gene_name = request.query_params.get("gene_name")

        if not gene_id and not gene_name:
            return Response(
                {"error": "You must provide gene_id or gene_name"}, status=400
            )

        # filtro para allele info
        allele_info_filter = Q(allele_frequency__isnull=False) & ~Q(allele_frequency=0)

        # filtro por gen
        if gene_id:
            allele_info_filter &= Q(allele__gene__id=gene_id)
        elif gene_name:
            allele_info_filter &= Q(allele__gene__name__icontains=gene_name)

        regions = (
            AlleleRegion.objects.prefetch_related(
                Prefetch(
                    "alleles",
                    queryset=AlleleRegionInfo.objects.filter(
                        allele_info_filter
                    ).select_related("allele", "allele__gene"),
                )
            )
            .filter(alleles__allele_frequency__isnull=False)
            .exclude(alleles__allele_frequency=0)
            .distinct()
        )

        # filtro adicional a nivel de región
        if gene_id:
            regions = regions.filter(alleles__allele__gene__id=gene_id)
        elif gene_name:
            regions = regions.filter(alleles__allele__gene__name__icontains=gene_name)

        serializer = AlleleRegionWithAllelesSerializer(regions, many=True)
        return Response(serializer.data)
