from rest_framework import serializers
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.serializers.allele_region_info import (
    AlleleRegionInfoDetailSerializer,
)


class AlleleRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegion
        fields = "__all__"


class AlleleRegionWithAllelesSerializer(serializers.ModelSerializer):
    alleles = AlleleRegionInfoDetailSerializer(many=True)

    class Meta:
        model = AlleleRegion
        fields = ["id", "population", "location", "lat", "lon", "alleles"]
        read_only_fields = [
            "id",
            "population",
            "location",
            "lat",
            "lon",
            "alleles",
        ]

    # def get_alleles(self, obj):
    #     # Usar el to_attr 'filtered_alleles'
    #     if hasattr(obj, "filtered_alleles"):
    #         allele_infos = obj.filtered_alleles
    #     else:
    #         # Fallback por si no se usó prefetch
    #         allele_infos = (
    #             obj.alleles.filter(allele_frequency__isnull=False)
    #             .exclude(allele_frequency=0)
    #             .select_related("allele", "allele__gene")
    #         )

    #     return AlleleRegionInfoDetailSerializer(allele_infos, many=True).data
