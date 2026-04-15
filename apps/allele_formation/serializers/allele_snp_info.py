from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.serializers.snp_allele_ancester_formation import (
    SNPAlleleAncesterFormationSerializer,
)
from apps.allele_formation.serializers.snp_allele_location_formation import (
    SNPAlleleLocationFormationSerializer,
)


class AlleleSNPInfoSerializer(serializers.ModelSerializer):
    location_formation = serializers.SerializerMethodField()
    ancester_formation = serializers.SerializerMethodField()

    class Meta:
        model = AlleleSNPInfo
        fields = [
            "id",
            "parents_info",
            "allele",
            "loss_ancesters_snp",
            "increment_ancesters_snp",
            "loss_location_snp",
            "increment_location_snp",
            "ancester_formation",
            "location_formation",
        ]

    @extend_schema_field(SNPAlleleLocationFormationSerializer(many=True))
    def get_location_formation(self, obj):
        return SNPAlleleLocationFormationSerializer(
            obj.location_formation.all(), many=True
        ).data

    @extend_schema_field(SNPAlleleAncesterFormationSerializer(many=True))
    def get_ancester_formation(self, obj):
        return SNPAlleleAncesterFormationSerializer(
            obj.ancester_formation.all(), many=True
        ).data
