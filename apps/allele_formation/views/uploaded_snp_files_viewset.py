from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets


from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles
from apps.allele_formation.serializers.uploaded_snp_files_serializer import (
    UploadedSNPFileSerializer,
)
from apps.common.views import CommonOrderingFilter


class UploadedSNPFilesViewSet(viewsets.ModelViewSet):
    queryset = UploadedSNPFiles.objects.select_related("gene").all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    serializer_class = UploadedSNPFileSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = ["system_user", "gene"]
    ordering_fields = "__all__"
