from rest_framework import serializers
from apps.allele_mapping.models.allele_region import AlleleRegion


class AlleleRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegion
        fields = "__all__"
