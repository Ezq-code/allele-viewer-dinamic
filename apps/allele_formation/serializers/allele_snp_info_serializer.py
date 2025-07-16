from rest_framework import serializers
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo


class AlleleSNPInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleSNPInfo
        fields = "__all__"
