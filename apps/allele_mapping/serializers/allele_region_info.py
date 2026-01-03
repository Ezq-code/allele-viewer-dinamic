from rest_framework import serializers
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo


class AlleleRegionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegionInfo
        fields = "__all__"
