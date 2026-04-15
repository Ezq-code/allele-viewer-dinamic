from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from django.db.models import F


from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles
from apps.allele_formation.serializers.uploaded_snp_files import (
    UploadedSNPFileSerializer,
)
from apps.common.views import CommonOrderingFilter


class UploadedSNPFilesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing uploaded SNP files.

    Provides CRUD operations for UploadedSNPFiles model instances with filtering,
    search, and ordering capabilities. Access is restricted to authenticated users
    or read-only for anonymous users.

    Features:
        - Filter by system_user and gene
        - Search functionality
        - Ordering on all fields
        - Select related gene for optimized queries
    """

    queryset = UploadedSNPFiles.objects.annotate(gene_name=F("gene__name")).all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    serializer_class = UploadedSNPFileSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = ["system_user", "gene"]
    ordering_fields = "__all__"
