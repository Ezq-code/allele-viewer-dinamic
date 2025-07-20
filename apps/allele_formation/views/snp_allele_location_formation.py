from rest_framework import viewsets
from apps.allele_formation.models.snp_allele_location_formation import (
    SNPAlleleLocationFormation,
)
from apps.allele_formation.serializers.snp_allele_location_formation import (
    SNPAlleleLocationFormationSerializer,
)


class SNPAlleleLocationFormationViewSet(viewsets.ModelViewSet):
    queryset = SNPAlleleLocationFormation.objects.all()
    serializer_class = SNPAlleleLocationFormationSerializer
