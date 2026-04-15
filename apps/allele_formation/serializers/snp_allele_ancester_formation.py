from rest_framework import serializers
from apps.allele_formation.models.snp_allele_ancester_formation import (
    SNPAlleleAncesterFormation,
)


class SNPAlleleAncesterFormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SNPAlleleAncesterFormation
        fields = "__all__"
