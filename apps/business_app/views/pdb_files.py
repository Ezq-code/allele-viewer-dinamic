from rest_framework import permissions, viewsets, status


from apps.business_app.models import PdbFiles
from rest_framework import mixins

from apps.business_app.models.site_configurations import SiteConfiguration
from apps.business_app.serializers.pdb_files import PdbFilesGraphUpdateSerializer

from rest_framework.response import Response

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph


# Create your views here.


class PdbFileViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED).all()
    serializer_class = PdbFilesGraphUpdateSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        config = SiteConfiguration.get_solo()
        config.nx_graph_k = serializer.validated_data.get("nx_graph_k")
        config.nx_graph_training_iterations = serializer.validated_data.get(
            "nx_graph_training_iterations"
        )
        config.nx_graph_scale = serializer.validated_data.get("nx_graph_scale")
        config.save(
            update_fields=[
                "nx_graph_training_iterations",
                "nx_graph_k",
                "nx_graph_scale",
            ]
        )

        for pdb_file in self.queryset:
            # recalcula aquí
            if pdb_file.original_file and pdb_file.original_file.original_file:
                processor_object = XslxToPdbGraph(pdb_file.original_file.original_file)
                # Process the file and get the processed content
                processor_object.proccess_initial_file_data(pdb_file.original_file.id)
                processor_object.proccess_pdb_file(
                    pdb_file.original_file.id, pdb_file.custom_name, pdb_file
                )

        return Response(
            f"{self.queryset.count()} PDB were updated", status=status.HTTP_202_ACCEPTED
        )

    def list(self, request, *args, **kwargs):
        instance = SiteConfiguration.get_solo()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
