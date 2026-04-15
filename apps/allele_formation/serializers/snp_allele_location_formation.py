from rest_framework import serializers
from apps.allele_formation.models.snp_allele_location_formation import (
    SNPAlleleLocationFormation,
)


class SNPAlleleLocationFormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SNPAlleleLocationFormation
        fields = "__all__"
