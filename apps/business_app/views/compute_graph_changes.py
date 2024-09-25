from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.common.views import CommonOrderingFilter
from apps.business_app.models import UploadedFiles
from apps.business_app.serializers import ComputeGraphChangesSerializer


# Create your views here.


class ComputeGraphChangesViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows to compute changes from graph.
    """

    queryset = UploadedFiles.objects.all().prefetch_related("pdb_files")
    serializer_class = ComputeGraphChangesSerializer
    search_fields = ["custom_name", "description"]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]