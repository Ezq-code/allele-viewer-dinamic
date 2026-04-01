from rest_framework import serializers
from apps.allele_mapping.models.allele_region_coord import AlleleRegionCoord


class AlleleRegionCoordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegionCoord
        fields = "__all__"
