from rest_framework import permissions, viewsets, status
from rest_framework.generics import GenericAPIView


from apps.business_app.models import PdbFiles
from rest_framework import mixins

from apps.business_app.serializers.pdb_files import PdbFilesSerializer

from rest_framework.response import Response


# Create your views here.


class PdbFileViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED).all()
    serializer_class = PdbFilesSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        retreived_objects_to_change = self.filter_queryset(self.get_queryset())
        for pdb_file in retreived_objects_to_change:
            # recalcula aquí
            pass

        
        return Response(status=status.HTTP_200_OK)