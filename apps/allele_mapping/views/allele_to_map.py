from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.serializers.allele_to_map import AlleleToMapSerializer


class AlleleToMapViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlleleToMap
    """

    queryset = AlleleToMap.objects.select_related("gene").filter(gene__isnull=False)
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

        # Obtener nombres únicos de alelos y extraer grupos en una sola pasada
        allele_names = self.filter_queryset(self.get_queryset()).values_list("name", flat=True).distinct().order_by("name").distinct()

        allelic_groups = [name.split(":")[0] for name in allele_names if ":" in name]
            

        # Retornar respuesta ordenada
        return Response({
            "allelic_groups": allelic_groups
        })

