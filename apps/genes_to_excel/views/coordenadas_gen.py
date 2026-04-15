from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models.caracteristica_gen import Gene

from ..models.caracteristica_gen import CaracteristicaGen
from ..serializers.coordenadas_gen import CaracteristicaGenCoordinatesSerializer

class CoordenadasGenViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaracteristicaGen.objects.all().select_related('gen')
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    serializer_class = CaracteristicaGenCoordinatesSerializer    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    filterset_fields = ['gen__name', 'cord']  # Simple y funciona
    
    # Búsqueda textual
    search_fields = ['gen__name', 'gene', 'cord']

    
