from rest_framework.response import Response
from rest_framework import generics, permissions

from apps.business_app.models.gene import Gene
from apps.business_app.serializers.gene_serializer import GeneSerializer


# Funciona
class GenListView(generics.ListAPIView):
    """
    View para listar todos los genes con su ID y nombre
    """

    queryset = Gene.objects.all().order_by("id")
    serializer_class = GeneSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        # Opción 1: Si quieres el formato completo del serializer
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
