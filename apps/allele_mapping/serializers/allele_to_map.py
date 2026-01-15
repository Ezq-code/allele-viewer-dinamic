from rest_framework import serializers
from apps.allele_mapping.models.allele_to_map import AlleleToMap


class AlleleToMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleToMap
        fields = "__all__"


class AlleleToMapDetailSerializer(serializers.ModelSerializer):
    gene_name = serializers.CharField(source='gene.name', read_only=True)

    class Meta:
        model = AlleleToMap
        fields = ['id', 'name', 'gene_name']
