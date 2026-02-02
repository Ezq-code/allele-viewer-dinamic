import django_filters
from django.db.models import Prefetch
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from django.core.cache import cache


class AlleleRegionFilter(django_filters.FilterSet):
    """
    Filtro personalizado para AlleleRegion
    """

    gene_name = django_filters.CharFilter(
        method="filter_by_gene_name", label="Gene Name"
    )
    allelic_group = django_filters.CharFilter(
        method="filter_by_allelic_group", label="Allelic Group"
    )
    min_allele_frequency = django_filters.NumberFilter(
        method="filter_by_min_allele_frequency", label="Min Allele Frequency"
    )
    max_allele_frequency = django_filters.NumberFilter(
        method="filter_by_max_allele_frequency", label="Max Allele Frequency"
    )
    min_sample_size = django_filters.NumberFilter(
        method="filter_by_min_sample_size", label="Min Sample Size"
    )
    max_sample_size = django_filters.NumberFilter(
        method="filter_by_max_sample_size", label="Max Sample Size"
    )

    class Meta:
        model = AlleleRegion
        fields = {
            "id": ["exact", "in"],
            "lat": ["gte", "lte"],
            "lon": ["gte", "lte"],
            "alleles__percent_of_individuals": ["gte", "lte"],
        }

    def _get_allele_ids_by_allelic_group(self, allelic_group):
        """
        Método auxiliar para obtener IDs de alelos por grupo alélico
        """
        # Normalizar el grupo alélico (ej: "A*01" -> "A*01:")
        cache_key = f"allelic_group_{allelic_group}"
        result = cache.get(cache_key)
        if not result:
            search_pattern = (
                allelic_group if ":" in allelic_group else f"{allelic_group}:"
            )
            result = AlleleToMap.objects.filter(
                name__startswith=search_pattern
            ).values_list("id", flat=True)
            cache.set(cache_key, result, None)
        return result

    def filter_by_min_sample_size(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen al menos el tamaño de muestra dado
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_min_sample_size_{value}"
        result = cache.get(cache_key)
        if not result:
            alleles_id = AlleleRegionInfo.objects.filter(
                sample_size__gte=value
            ).values_list("region_id", flat=True)
            result = queryset.filter(id__in=alleles_id)
            cache.set(cache_key, result, None)
        return result

    def filter_by_max_sample_size(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen como máximo el tamaño de muestra dado
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_max_sample_size_{value}"
        result = cache.get(cache_key)
        if not result:
            alleles_id = AlleleRegionInfo.objects.filter(
                sample_size__lte=value
            ).values_list("region_id", flat=True)
            result = queryset.filter(id__in=alleles_id)
            cache.set(cache_key, result, None)
        return result

    def filter_by_min_allele_frequency(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen al menos la frecuencia alélica dada
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_min_allele_frequency_{value}"
        result = cache.get(cache_key)
        if not result:
            alleles_id = AlleleRegionInfo.objects.filter(
                allele_frequency__gte=value
            ).values_list("region_id", flat=True)
            result = queryset.filter(id__in=alleles_id)
            cache.set(cache_key, result, None)
        return result

    def filter_by_max_allele_frequency(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen como máximo la frecuencia alélica dada
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_max_allele_frequency_{value}"
        result = cache.get(cache_key)
        if not result:
            alleles_id = AlleleRegionInfo.objects.filter(
                allele_frequency__lte=value
            ).values_list("region_id", flat=True)
            result = queryset.filter(id__in=alleles_id)
            cache.set(cache_key, result, None)
        return result

    def filter_by_allelic_group(self, queryset, name, value):
        """
        Filtra las regiones que tienen alelos del grupo alélico especificado
        """
        if not value:
            return queryset

        # Generar clave de caché única
        cache_key = f"allelic_group_filter_{value}"

        # Intentar obtener del caché
        result = cache.get(cache_key)
        if not result:
            allele_list = self._get_allele_ids_by_allelic_group(value)
            if not allele_list:
                return queryset.none()

            # Obtener regiones que tienen esos alelos
            region_ids = list(
                AlleleRegionInfo.objects.filter(allele_id__in=allele_list)
                .values_list("region_id", flat=True)
                .distinct()
            )

            # Aplicar Prefetch para filtrar también los alelos relacionados
            result = queryset.filter(id__in=region_ids).prefetch_related(
                Prefetch(
                    "alleles",
                    queryset=AlleleRegionInfo.objects.filter(
                        allele_id__in=allele_list,
                        allele_frequency__isnull=False,
                        allele_frequency__gt=0,
                    ).select_related("allele", "allele__gene"),
                    to_attr="filtered_alleles",
                )
            )

            # Guardar en caché
            cache.set(cache_key, result, None)
        return result

    def filter_by_gene_name(self, queryset, name, value):
        """
        Filtra las regiones que tienen alelos del gen especificado
        y aplica un Prefetch para mostrar solo los alelos de ese gen
        """
        if not value:
            return queryset

        # Generar clave de caché única
        cache_key = f"gene_filter_{value}"

        # Intentar obtener del caché
        cached_data = cache.get(cache_key)

        if cached_data:
            allele_list, region_ids = cached_data
        else:
            # Obtener los IDs de genes, alelos y regiones que coinciden
            allele_list = list(
                AlleleToMap.objects.filter(gene__name=value).values_list(
                    "id", flat=True
                )
            )
            region_ids = list(
                AlleleRegionInfo.objects.filter(allele_id__in=allele_list)
                .values_list("region_id", flat=True)
                .distinct()
            )

            cache.set(cache_key, (allele_list, region_ids), None)

        # Aplicar Prefetch para filtrar también los alelos relacionados
        filtered_queryset = queryset.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=AlleleRegionInfo.objects.filter(
                    allele_id__in=allele_list,
                    allele_frequency__isnull=False,
                    allele_frequency__gt=0,
                ).select_related("allele", "allele__gene"),
                to_attr="filtered_alleles",
            )
        )

        return filtered_queryset

    # def filter_queryset(self, queryset):
    #     """
    #     Sobrescribir para manejar múltiples filtros combinados
    #     """
    #     # Aplicar filtros base primero
    #     queryset = super().filter_queryset(queryset)

    #     # Verificar si tenemos filtros combinados (gene_name + allelic_group)
    #     gene_name = self.data.get('gene_name')
    #     allelic_group = self.data.get('allelic_group')

    #     if gene_name and allelic_group:
    #         # Caso especial: filtro combinado
    #         cache_key = f"combined_filter_{gene_name}_{allelic_group}"

    #         cached_data = cache.get(cache_key)

    #         if cached_data:
    #             allele_list, region_ids = cached_data
    #         else:
    #             # Obtener alelos del gen específico
    #             gene_allele_list = list(
    #                 AlleleToMap.objects.filter(gene__name=gene_name)
    #                 .values_list("id", flat=True)
    #             )

    #             # Obtener alelos del grupo alélico
    #             allelic_group_ids = self._get_allele_ids_by_allelic_group(allelic_group)

    #             # Intersección: alelos que pertenecen tanto al gen como al grupo alélico
    #             combined_allele_list = list(set(gene_allele_list) & set(allelic_group_ids))

    #             if not combined_allele_list:
    #                 return queryset.none()

    #             # Obtener regiones
    #             region_ids = list(
    #                 AlleleRegionInfo.objects.filter(allele_id__in=combined_allele_list)
    #                 .values_list("region_id", flat=True)
    #                 .distinct()
    #             )

    #             cache.set(cache_key, (combined_allele_list, region_ids), None)

    #         # Aplicar Prefetch con la combinación
    #         queryset = queryset.filter(id__in=region_ids).prefetch_related(
    #             Prefetch(
    #                 "alleles",
    #                 queryset=AlleleRegionInfo.objects.filter(
    #                     allele_id__in=combined_allele_list,
    #                     allele_frequency__isnull=False,
    #                     allele_frequency__gt=0,
    #                 ).select_related("allele", "allele__gene"),
    #                 to_attr="filtered_alleles",
    #             )
    #         )

    #     return queryset
