from rest_framework import viewsets
from apps.allele_formation.models.snp_allele_location_formation import (
    SNPAlleleLocationFormation,
)
from apps.allele_formation.serializers.snp_allele_location_formation_serializer import (
    SNPAlleleLocationFormationSerializer,
)


class SNPAlleleLocationFormationViewSet(viewsets.ModelViewSet):  # ! NOT USED FOR NOW
    """
    ViewSet for managing SNP allele location formation data.
    
    Provides CRUD operations for SNPAlleleLocationFormation model instances.
    Note: This ViewSet is not currently in use.
    """
    
    queryset = SNPAlleleLocationFormation.objects.all()
    serializer_class = SNPAlleleLocationFormationSerializer
