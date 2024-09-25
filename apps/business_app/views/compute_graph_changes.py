from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.common.views import CommonOrderingFilter
from apps.business_app.models import PdbFiles
from apps.business_app.serializers import UploadedFilesSerializer


# Create your views here.


class PdbFileViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows to compute changes from graph files only.
    """

    queryset = PdbFiles.objects.filter("GRAPH")
    

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]