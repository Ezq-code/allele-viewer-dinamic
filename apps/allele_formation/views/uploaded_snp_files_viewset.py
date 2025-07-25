from rest_framework import viewsets, filters

from django_filters.rest_framework import DjangoFilterBackend


from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles
from apps.allele_formation.serializers.uploaded_snp_files_serializer import (
    UploadedSNPFileSerializer,
)
from apps.common.views import CommonOrderingFilter


class UploadedSNPFilesViewSet(viewsets.ModelViewSet):
    queryset = UploadedSNPFiles.objects.all().prefetch_related(
        "ancester_formation", "location_formation"
    )
    serializer_class = UploadedSNPFileSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = [
        "system_user",
    ]
    ordering_fields = "__all__"
