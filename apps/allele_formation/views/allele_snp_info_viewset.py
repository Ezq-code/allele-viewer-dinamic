from rest_framework import viewsets, filters, permissions
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo

from django_filters.rest_framework import DjangoFilterBackend


from apps.allele_formation.serializers.allele_snp_info_serializer import (
    AlleleSNPInfoSerializer,
)
from apps.common.views import CommonOrderingFilter


class AlleleSNPInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing allele SNP information.
    
    Provides read-only access to AlleleSNPInfo model instances with filtering,
    search, and ordering capabilities. This endpoint is publicly accessible
    (AllowAny permission) and only includes data from predefined uploaded files.
    
    Features:
        - Read-only operations (list and retrieve)
        - Filter by allele and uploaded_file__gene
        - Search functionality
        - Ordering on all fields
        - Prefetch related ancestor and location formation data
        - Only includes predefined uploaded files
    """
    
    queryset = AlleleSNPInfo.objects.prefetch_related(
        "ancester_formation", "location_formation"
    ).filter(uploaded_file__predefined=True)
    serializer_class = AlleleSNPInfoSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = ["allele", "uploaded_file__gene"]
    ordering_fields = "__all__"
    permission_classes = [permissions.AllowAny]
