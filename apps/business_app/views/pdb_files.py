import os

from rest_framework import permissions, viewsets, status

from apps.business_app.models import PdbFiles
from rest_framework import mixins

from apps.business_app.serializers.pdb_files import PdbFilesSerializer

from rest_framework.response import Response

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph


# Create your views here.


class PdbFileViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED).all()
    serializer_class = PdbFilesSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        for pdb_file in self.queryset:
            # recalcula aquí
            processor_object = XslxToPdbGraph(pdb_file.original_file.original_file)
            # Process the file and get the processed content
            processor_object.proccess_initial_file_data(self.id)
            processor_object.proccess_pdb_file(pdb_file.original_file.id, pdb_file.custom_name, pdb_file)

            pass

        
        return Response(status=status.HTTP_200_OK)