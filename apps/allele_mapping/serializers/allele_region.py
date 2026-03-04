from rest_framework import serializers
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.serializers.allele_region_info import (
    AlleleRegionInfoDetailSerializer,
)
from ..serializers.allele_region_coord import AlleleRegionCoordSerializer


class AlleleRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleRegion
        fields = "__all__"


class AlleleRegionWithAllelesSerializer(serializers.ModelSerializer):
    alleles = serializers.SerializerMethodField()
    coordinates = AlleleRegionCoordSerializer(many=True, read_only=True)

    class Meta:
        model = AlleleRegion
        fields = [
            "id",
            "population",
            "alleles",
            "coordinates",
        ]

    def get_alleles(self, obj):
        """
        Obtener alelos, priorizando los filtrados si existen
        Optimizado para ordenar en base de datos en lugar de Python
        """
        if hasattr(obj, "filtered_alleles"):
            # Ya están ordenados por el Prefetch con order_by
            allele_infos = obj.filtered_alleles
        else:
            # Fallback: obtener todos los alelos con frecuencia > 0 y ordenar en DB
            allele_infos = (
                obj.alleles.filter(
                    allele_frequency__isnull=False, allele_frequency__gt=0
                )
                .select_related("allele", "allele__gene")
                .order_by("-allele_frequency")
            )

        return AlleleRegionInfoDetailSerializer(allele_infos, many=True).data
