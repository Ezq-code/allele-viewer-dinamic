from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.common.views import CommonOrderingFilter
from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles
from apps.genes_to_excel.serializers.genes_to_excel_files import (
    GenesToExcelFilesSerializer,
)


class GenesToExcelFilesViewSet(viewsets.ModelViewSet, GenericAPIView):
    """API endpoint for managing genes-to-excel uploaded files."""

    queryset = GenesToExcelFiles.objects.select_related("system_user", "gene")
    serializer_class = GenesToExcelFilesSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, CommonOrderingFilter]
    filterset_fields = ["system_user", "gene"]
    search_fields = ["custom_name", "description", "file", "system_user__username"]
    ordering_fields = "__all__"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]