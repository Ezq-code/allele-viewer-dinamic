from rest_framework import serializers
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo


class AlleleRegionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegionInfo
        fields = "__all__"


class AlleleRegionInfoDetailSerializer(serializers.ModelSerializer):
    allele_name = serializers.CharField(source='allele.name', read_only=True)
    gene_name = serializers.CharField(source='allele.gene.name', read_only=True)

    class Meta:
        model = AlleleRegionInfo
        fields = [
            'id',
            'allele_name',
            'gene_name',
            'allele_frequency',
            'percent_of_individuals',
            'sample_size'
        ]