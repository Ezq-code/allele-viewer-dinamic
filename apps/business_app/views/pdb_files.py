from rest_framework import permissions
from rest_framework.generics import GenericAPIView


from apps.business_app.models import PdbFiles
from rest_framework import mixins


# Create your views here.


class PdbFileViewSet(mixins.RetrieveModelMixin, GenericAPIView):
    """
    API endpoint that allows to compute changes on graph data.
    """

    queryset = PdbFiles.objects.filter(kind=PdbFiles.KIND.GRAPH_GENERATED)

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]