from rest_framework import serializers
from apps.allele_formation.models.snp_allele_parents_formation import (
    SNPAlleleParentsFormation,
)


class SNPAlleleParentsFormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SNPAlleleParentsFormation
        fields = "__all__"
