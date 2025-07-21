from rest_framework import viewsets
from apps.allele_formation.models.snp_allele_ancester_formation import (
    SNPAlleleAncesterFormation,
)
from apps.allele_formation.serializers.snp_allele_ancester_formation_serializer import (
    SNPAlleleAncesterFormationSerializer,
)


class SNPAlleleAncesterFormationViewSet(viewsets.ModelViewSet):
    queryset = SNPAlleleAncesterFormation.objects.all()
    serializer_class = SNPAlleleAncesterFormationSerializer
