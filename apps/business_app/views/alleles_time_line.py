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
        #Load parameters
        id_pdb = request.data["id_pdb"]
        input_date = request.data["date"] 
        #Filter the PDB File
        pdb_file = PdbFiles.objects.get(id=id_pdb)
        pdb_file_name = pdb_file.original_file.original_file
        #Create the Graph
        processor_object = XslxToPdbGraph(pdb_file_name)
        processor_object.proccess_initial_file_data(pdb_file.original_file.id)
        #Ejecución del algoritmo que extrae los alleles según fecha
        my_date = datetime.strptime(input_date, '%Y-%m-%d')
        list_alleles_time_line = processor_object.proccess_alleles_time_line(my_date)  
        
        return JsonResponse(list_alleles_time_line, safe=False)