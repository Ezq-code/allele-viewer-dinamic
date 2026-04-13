from rest_framework.generics import GenericAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from ..serializers.caracteristica_gen import CaracteristicaGenSerializer
from ..models.caracteristica_gen import CaracteristicaGen


class CaracteristicaGenViewSet(viewsets.ReadOnlyModelViewSet, GenericAPIView):
    queryset = CaracteristicaGen.objects.all()
    serializer_class = CaracteristicaGenSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['gen__name']
    search_fields = ['gen__name', 'gene']

