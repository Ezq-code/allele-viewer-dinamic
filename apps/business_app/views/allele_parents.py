from django.http import JsonResponse
from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView

from drf_spectacular.utils import extend_schema

from rest_framework import mixins

from rest_framework.response import Response

from apps.business_app.models import PdbFiles

from apps.business_app.serializers.allele_parents import AlleleInputSerializer

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph

# Create your views here.
class AlleleParentsViewSet(viewsets.ViewSet, GenericAPIView):
    """
    API endpoint that allows to compute extract allele family parents tree.
    Recieve as imput parameters an ID PDB and Allele number (eg. 285)
    """
    serializer_class = AlleleInputSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def create(self, request):        
        #Load parameters
        serializer_params = AlleleInputSerializer(data=request.data)
        if serializer_params.is_valid():
            id_pdb = serializer_params._validated_data.get("id_pdb")
            allele_id = serializer_params._validated_data.get("id_allele")
            try:
                #Filter the PDB File
                if id_pdb <= 0:
                    return Response("PdbFiles id must be greater than 0", status=status.HTTP_204_NO_CONTENT)
                
                pdb_file = PdbFiles.objects.get(id=id_pdb)
                if pdb_file is None:
                    return Response("PdbFiles is empty", status=status.HTTP_204_NO_CONTENT)

                pdb_file_name = pdb_file.original_file.original_file
                #Create the Graph
                processor_object = XslxToPdbGraph(pdb_file_name)
                processor_object.proccess_initial_file_data(pdb_file.original_file.id)
                #Ejecución del algoritmo que extrae los alleles parents (1574,131,5)
                list_alleles = processor_object.proccess_allele_parents(allele_id)  
            
                return JsonResponse(list_alleles, safe=False, status=status.HTTP_200_OK)
            
            except FileNotFoundError as e:
                raise Response(e, status=status.HTTP_404_NOT_FOUND)
            
        return Response(serializer_params.errors, status=status.HTTP_400_BAD_REQUEST)
        