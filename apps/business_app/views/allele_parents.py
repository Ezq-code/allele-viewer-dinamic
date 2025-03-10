from django.http import JsonResponse
from rest_framework import permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.business_app.serializers.allele_parents import AlleleParentsSerializer

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph

from apps.business_app.models.uploaded_files import UploadedFiles


# Create your views here.
class AlleleParentsViewSet(viewsets.ViewSet, GenericAPIView):
    """
    API endpoint that allows to compute extract allele family parents tree.
    Recieve as imput parameters an ID PDB and Allele number (eg. 285)
    """

    # queryset = PdbFiles.objects.all()
    serializer_class = AlleleParentsSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Load parameters
        pdb = serializer.validated_data.get("pdb")
        allele_node = serializer.validated_data.get("allele_node")
        # Filter the PDB File
        pdb_file = UploadedFiles.objects.get(id=pdb)
        # Create the Graph
        processor_object = XslxToPdbGraph(pdb_file.original_file)
        processor_object.proccess_initial_file_data(pdb)
        # Ejecución del algoritmo que extrae los alleles parents (1574,131,5)
        list_alleles = processor_object.proccess_allele_parents(allele_node)

        return JsonResponse(list_alleles, safe=False)
