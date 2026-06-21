from rest_framework.generics import GenericAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.business_app.serializers.gene import GeneSimpleSerializer
from apps.business_app.models.gene import Gene
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


from ..serializers.caracteristica_gen import CaracteristicaGenSerializer
from ..models.caracteristica_gen import CaracteristicaGen
from apps.common.views import GetAllMixin


class CaracteristicaGenViewSet(
    GetAllMixin, viewsets.ReadOnlyModelViewSet, GenericAPIView
):
    queryset = CaracteristicaGen.objects.all()
    serializer_class = CaracteristicaGenSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["gen_id", "cord", "protein"]
    search_fields = ["gen__name", "gene"]

    @action(
        detail=False,
        methods=["get"],
        url_path="get-related-genes",
        url_name="get-related-genes",
        serializer_class=GeneSimpleSerializer,
    )
    def get_related_genes(self, request):
        genes_id = self.get_queryset().values_list("gen_id", flat=True).distinct()

        serializer = self.get_serializer(
            Gene.objects.filter(id__in=genes_id).only("id", "name").order_by("name"),
            many=True,
        )

        return Response({"results": serializer.data})

    @method_decorator(cache_page(timeout=None))  # Cache por 15 minutos
    def list(self, request, *args, **kwargs):
        """
        Lista todos los AlleleRegionInfo con filtros aplicados
        """
        return super().list(request, *args, **kwargs)


