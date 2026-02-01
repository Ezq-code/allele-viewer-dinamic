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
    alleles = serializers.SerializerMethodField()
    allelic_groups = serializers.SerializerMethodField()

    class Meta:
        model = AlleleRegion
        fields = [
            'id',
            'population',
            'location',
            'lat',
            'lon',
            'allelic_groups',
            'alleles'
        ]

    def get_allelic_groups(self, obj):
        """
        Extraer grupos alélicos únicos de los alelos de esta región
        """
        if hasattr(obj, 'filtered_alleles'):
            allele_infos = obj.filtered_alleles
        else:
            # Si no hay filtered_alleles, usar todos los alelos
            allele_infos = obj.alleles.all()

        groups = set()
        for info in allele_infos:
            if info.allele and info.allele.name:
                # Extraer grupo alélico (ej: de "A*01:01" extraer "A*01")
                # Patrón: todo hasta el segundo ":"
                parts = info.allele.name.split(':')
                if len(parts) >= 2:
                    # Tomar la primera parte (gen + grupo)
                    group = parts[0]
                    groups.add(group)

        return sorted(list(groups))

    def get_alleles(self, obj):
        """
        Obtener alelos, priorizando los filtrados si existen
        """
        if hasattr(obj, 'filtered_alleles'):
            allele_infos = obj.filtered_alleles
        else:
            # Fallback: obtener todos los alelos con frecuencia > 0
            allele_infos = obj.alleles.filter(
                allele_frequency__isnull=False,
                allele_frequency__gt=0
            ).select_related('allele', 'allele__gene')

        # Ordenar por frecuencia descendente
        allele_infos = sorted(
            allele_infos,
            key=lambda x: x.allele_frequency if x.allele_frequency else 0,
            reverse=True
        )

        return AlleleRegionInfoDetailSerializer(allele_infos, many=True).data
