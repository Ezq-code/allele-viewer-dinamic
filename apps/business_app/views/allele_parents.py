from django.http import JsonResponse
from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView

from drf_spectacular.utils import extend_schema

from rest_framework import mixins

from rest_framework.response import Response

from apps.business_app.models import PdbFiles

from apps.business_app.serializers.allele_parents import AlleleParentSerializer, AlleleInputSerializer

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph

# Create your views here.

class AlleleParentsViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    API endpoint that allows to compute extract allele family parents tree.
    """

    queryset = PdbFiles.objects.all()
    serializer_class = AlleleParentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        request=AlleleInputSerializer,
    )
    def list(self, request, event_id, *args, **kwargs):
        print("Número de PDB en el store",len(self.queryset))
        
        #Lista de alleles familiares
        list_alleles = [1, 2, 3, 4]

        return JsonResponse(list_alleles, safe=False)
