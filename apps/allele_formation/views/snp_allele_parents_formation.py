from rest_framework import viewsets
from apps.allele_formation.models.snp_allele_parents_formation import (
    SNPAlleleParentsFormation,
)
from apps.allele_formation.serializers.snp_allele_parents_formation import (
    SNPAlleleParentsFormationSerializer,
)


class SNPAlleleParentsFormationViewSet(viewsets.ModelViewSet):
    queryset = SNPAlleleParentsFormation.objects.all()
    serializer_class = SNPAlleleParentsFormationSerializer
