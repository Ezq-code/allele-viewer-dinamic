from rest_framework import viewsets
from apps.allele_formation.models.snp_allele_ancester_formation import (
    SNPAlleleAncesterFormation,
)
from apps.allele_formation.serializers.snp_allele_ancester_formation import (
    SNPAlleleAncesterFormationSerializer,
)


class SNPAlleleAncesterFormationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing SNP allele ancestor formation data.

    Provides CRUD operations for SNPAlleleAncesterFormation model instances.
    Note: This ViewSet is not currently in use.
    """

    queryset = SNPAlleleAncesterFormation.objects.all()
    serializer_class = SNPAlleleAncesterFormationSerializer
