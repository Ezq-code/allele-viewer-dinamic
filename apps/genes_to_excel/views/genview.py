from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.db import transaction
from django.shortcuts import get_object_or_404

from apps.business_app.models.gene import Gene
from apps.business_app.serializers.gene_serializer import GeneSerializer
from ..serializers.gendataserializer import GenDataSerializer


class GenListView(generics.ListAPIView):
    """
    View para listar todos los genes con su ID y nombre
    """
    queryset = Gene.objects.all().order_by('id')
    serializer_class = GeneSerializer
    
    def list(self, request, *args, **kwargs):
        # Opción 1: Si quieres el formato completo del serializer
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
class GenViewSet(viewsets.ModelViewSet):
    queryset = Gene.objects.all()
    serializer_class = GeneSerializer
    
    @action(detail=True, methods=['get'])
    def caracteristicas(self, request, pk=None):
        """Obtiene todas las características de un gen específico"""
        gen = self.get_object()
        caracteristicas = gen.caracteristicas.all()
        serializer = GenDataSerializer(caracteristicas, many=True)
        return Response(serializer.data)

