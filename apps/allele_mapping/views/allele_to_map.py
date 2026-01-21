from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.business_app.models.gene import Gene
from apps.allele_mapping.serializers.allele_to_map import AlleleToMapSerializer, GeneListSerializer

from rest_framework.decorators import action
from rest_framework.response import Response


class AlleleToMapViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleToMap
    """

    queryset = AlleleToMap.objects.all()
    serializer_class = AlleleToMapSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = [
        "name",
        "gene__name",
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'], url_path='genes')
    def get_genes(self, request):
        """
        Endpoint para obtener la lista de genes únicos que tienen alelos en AlleleToMap
        """
        # Filtrar solo genes que tienen al menos un alelo en AlleleToMap
        genes = Gene.objects.filter(
            allele_mapping_files__isnull=False  # Este es el related_name de AlleleToMap
        ).distinct().order_by('name')

        # Opcional: Podemos agregar filtro por nombre de gen
        search = request.query_params.get('search')
        if search:
            genes = genes.filter(name__icontains=search)

        serializer = GeneListSerializer(genes, many=True)
        return Response(serializer.data)
