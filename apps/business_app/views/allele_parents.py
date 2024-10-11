from django.http import JsonResponse
from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView

from drf_spectacular.utils import extend_schema

from rest_framework import mixins

from rest_framework.response import Response

from apps.business_app.models import PdbFiles

from apps.business_app.serializers.allele_parents import AlleleInputSerializer
from apps.business_app.serializers.allele_parents import AlleleParentSerializer

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph

# Create your views here.

#@extend_schema(
#    request=AlleleInputSerializer,
#    methods=["GET"],
#    description="Set of parameters to PDB and Allele",
#    responses={200: AlleleParentSerializer},
#)
class AlleleParentsViewSet(
     mixins.ListModelMixin, viewsets.GenericViewSet, GenericAPIView
):
    """
    API endpoint that allows to compute extract allele family parents tree.
    """

    queryset = PdbFiles.objects.all()
    serializer_class = AlleleParentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

       
    def list(self, request):        
        print("Número de PDB en el store",len(self.queryset))
        print(request.data)
        pdb_file_name = ""
        allele_id = 258
        list_alleles = []
        for pdb_file in self.queryset:
            pdb_file_name = pdb_file.original_file.original_file
            processor_object = XslxToPdbGraph(pdb_file_name)
            processor_object.proccess_initial_file_data(pdb_file.original_file.id)
            #Ejecución del algoritmo que extrae los alleles parents
            list_alleles.append(processor_object.proccess_allele_parents(allele_id))   
        
        

        return JsonResponse(list_alleles, safe=False)
