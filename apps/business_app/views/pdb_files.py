from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView


from apps.business_app.models import PdbFiles
from rest_framework import mixins

from apps.business_app.models.site_configurations import SiteConfiguration
from apps.business_app.serializers.pdb_files import PdbFilesGraphUpdateSerializer

from rest_framework.response import Response

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph


# Create your views here.


class PdbFileViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED).all()
    serializer_class = PdbFilesGraphUpdateSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        for pdb_file in self.queryset:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            config = SiteConfiguration.get_solo()
            config.nx_graph_dim = serializer.validated_data.get("nx_graph_dim")
            config.nx_graph_k = serializer.validated_data.get("nx_graph_k")
            config.nx_graph_training_iterations = serializer.validated_data.get(
                "nx_graph_training_iterations"
            )
            config.save(
                update_fields=[
                    "nx_graph_training_iterations",
                    "nx_graph_k",
                    "nx_graph_dim",
                ]
            )
            # recalcula aquí
            if pdb_file.original_file and pdb_file.original_file.original_file:
                processor_object = XslxToPdbGraph(pdb_file.original_file.original_file)
                # Process the file and get the processed content
                processor_object.proccess_initial_file_data(self.id)
                processor_object.proccess_pdb_file(
                    pdb_file.original_file.id, pdb_file.custom_name, pdb_file
                )

        return Response(status=status.HTTP_200_OK)
