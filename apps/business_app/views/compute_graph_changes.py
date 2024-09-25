from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.common.views import CommonOrderingFilter
from apps.business_app.models import UploadedFiles
from apps.business_app.serializers import UploadedFilesSerializer


# Create your views here.


class ComputeGraphChangesViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows to compute changes from graph files only.
    """

    queryset = UploadedFiles.objects.all().prefetch_related("GRAPH")
    serializer_class = UploadedFilesSerializer
    search_fields = ["custom_name", "description"]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]