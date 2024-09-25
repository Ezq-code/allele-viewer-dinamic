from rest_framework import permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.business_app.models import PdbFiles
from rest_framework import mixins

from apps.business_app.serializers.pdb_files import PdbFilesSerializer


# Create your views here.


class PdbFileViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED).all()
    serializer_class = PdbFilesSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]