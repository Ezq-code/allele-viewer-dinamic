from django.http import JsonResponse
from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView

from drf_spectacular.utils import extend_schema

from rest_framework import mixins

from rest_framework.response import Response

from apps.business_app.models import PdbFiles

from apps.business_app.serializers.alleles_time_line import AlleleInputDateSerializer

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph

from datetime import datetime

# Create your views here.
class AlleleTimeLineViewSet(viewsets.ViewSet, GenericAPIView):
    """
    API endpoint that allows extract alleles under an especific date
    """
    serializer_class = AlleleInputDateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def create(self, request):        
        serializer_params = AlleleInputDateSerializer(data=request.data)
        if serializer_params.is_valid():
            id_pdb = serializer_params._validated_data.get("id_pdb")
            date = serializer_params._validated_data.get("date")
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
                #Ejecución del algoritmo que extrae los alleles según fecha
                list_alleles_time_line = processor_object.proccess_alleles_time_line(date)  
            
                return JsonResponse(list_alleles_time_line, safe=False, status=status.HTTP_200_OK)
            
            except FileNotFoundError as e:
                raise Response(e, status=status.HTTP_404_NOT_FOUND)
            
        return Response(serializer_params.errors, status=status.HTTP_400_BAD_REQUEST)
    
       
        