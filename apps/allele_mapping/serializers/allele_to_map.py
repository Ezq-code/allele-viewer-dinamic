from rest_framework import serializers
from apps.allele_mapping.models.allele_to_map import AlleleToMap


class AlleleToMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleToMap
        fields = "__all__"
