from rest_framework import serializers
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.serializers.allele_region_coord import (
    AlleleRegionCoordSerializer,
)


class AlleleRegionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegionInfo
        fields = "__all__"


class AlleleRegionInfoDetailSerializer(serializers.ModelSerializer):
    allele_name = serializers.CharField(source="allele.name", read_only=True)
    gene_name = serializers.CharField(source="allele.gene.name", read_only=True)
    allele_frequency = serializers.SerializerMethodField()

    class Meta:
        model = AlleleRegionInfo
        fields = [
            "id",
            "allele_name",
            "gene_name",
            "allele_frequency",
            "percent_of_individuals",
            "sample_size",
        ]

    def get_allele_frequency(self, obj):
        # Multiplicar por 100 para convertir a porcentaje
        if obj.allele_frequency is not None:
            return obj.allele_frequency * 100
        return None


class AlleleRegionInfoWithRegionSerializer(serializers.ModelSerializer):
    allele_name = serializers.CharField(source="allele.name", read_only=True)
    gene_name = serializers.CharField(source="allele.gene.name", read_only=True)
    region_name = serializers.CharField(source="region.population", read_only=True)
    region_location = serializers.CharField(source="region.location", read_only=True)
    region_lat = serializers.FloatField(read_only=True)
    region_lon = serializers.FloatField(read_only=True)
    studies_coord = AlleleRegionCoordSerializer(source="region.coordinates", many=True)

    class Meta:
        model = AlleleRegionInfo
        fields = [
            "id",
            "allele_name",
            "gene_name",
            "allele_frequency",
            "percent_of_individuals",
            "sample_size",
            "region_name",
            "kind_of_info",
            "region_location",
            "region_lat",
            "region_lon",
            "studies_coord",
        ]
        read_only_fields = [
            "id",
            "allele_frequency",
            "percent_of_individuals",
            "sample_size",
            "region_lat",
            "region_lon",
            "studies_coord",
        ]
