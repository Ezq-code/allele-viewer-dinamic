from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.decorators import action


from apps.common.views import CommonOrderingFilter
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.uploaded_files import (
    UploadedFilesSerializer,
    SimpleListUploadedFilesSerializer,
)

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

# Create your views here.


class UploadedFilesViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows file upload extensions added or edited.
    """

    queryset = (
        UploadedFiles.objects.filter(processed=True)
        .select_related("gene")
        .prefetch_related("pdb_files", "allele_nodes")
    )
    serializer_class = UploadedFilesSerializer
    search_fields = ["custom_name", "description"]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = [
        "gene",
    ]
    ordering = ("-predefined",)

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @method_decorator(cache_page(timeout=None, key_prefix="retreive_uploaded_file"))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["GET"],
        url_path="simple-list",
        url_name="simple-list",
        serializer_class=SimpleListUploadedFilesSerializer,
    )
    def simple_list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
