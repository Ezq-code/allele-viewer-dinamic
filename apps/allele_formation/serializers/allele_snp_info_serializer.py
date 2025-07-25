from rest_framework import serializers
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.serializers.snp_allele_ancester_formation_serializer import (
    SNPAlleleAncesterFormationSerializer,
)
from apps.allele_formation.serializers.snp_allele_location_formation_serializer import (
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

    def get_location_formation(self, obj):
        return SNPAlleleLocationFormationSerializer(
            obj.location_formation.all(), many=True
        ).data

    def get_ancester_formation(self, obj):
        return SNPAlleleAncesterFormationSerializer(
            obj.ancester_formation.all(), many=True
        ).data
