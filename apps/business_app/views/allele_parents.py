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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    #@extend_schema(
    #    request=AlleleInputSerializer,
    #    methods=["GET"],
    #    description="Set of parameters to PDB and Allele",
    #    responses={200: AlleleParentSerializer},
    #)
    def list(self, request, *args, **kwargs):
        print("Número de PDB en el store",len(self.queryset))
        for pdb_file in self.queryset:
            processor_object = XslxToPdbGraph(pdb_file.original_file.original_file)
            processor_object.proccess_initial_file_data(pdb_file.original_file.id)
            print(processor_object.proccess_allele_parents(2))    
        
        #Lista de alleles familiares
        list_alleles = [1, 2, 3, 4]

        return JsonResponse(list_alleles, safe=False)
