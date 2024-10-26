from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView

from drf_spectacular.utils import extend_schema

from rest_framework import mixins

from rest_framework.response import Response

from apps.business_app.models import PdbFiles

from apps.business_app.serializers.allele_parents import AlleleParentsSerializer

from apps.business_app.utils.xslx_to_pdb_graph import (
    XslxToPdbGraph,
    proccess_allele_adjacents,
)

from apps.business_app.models.uploaded_files import UploadedFiles
from django.core.cache import cache


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
        # pdb = serializer.validated_data.get("pdb")
        uploaded_file = serializer.validated_data.get("uploaded_file")
        allele_node = serializer.validated_data.get("allele_node")
        # Filter the PDB File
        # pdb_file = UploadedFiles.objects.get(id=pdb)
        # Create the Graph
        cached_graph_key = uploaded_file.original_file
        cached_graph = cache.get(cached_graph_key)
        if not cached_graph:
            processor_object = XslxToPdbGraph(cached_graph_key)
            processor_object.proccess_initial_file_data()
        # Ejecución del algoritmo que extrae los alleles parents (1574,131,5)

        parents_tree, children_tree = proccess_allele_adjacents(
            allele_node, cache.get(cached_graph_key)
        )

        return Response({"parents_tree": parents_tree, "children_tree": children_tree})
