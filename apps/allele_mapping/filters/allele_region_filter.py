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
    alleles_list = django_filters.CharFilter(
        method="filter_by_alleles_list", label="Alleles List (comma separated)"
    )
    country = django_filters.CharFilter(
        method="filter_by_country", label="Country (first word of population)"
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

    # Base queryset para AlleleRegionInfo (frecuencias válidas)
    allele_region_info = AlleleRegionInfo.objects.filter(
        allele_frequency__isnull=False,
        allele_frequency__gt=0
    )

    class Meta:
        model = AlleleRegion
        fields = {
            "id": ["exact", "in"],
            "lat": ["gte", "lte"],
            "lon": ["gte", "lte"],
            "alleles__percent_of_individuals": ["gte", "lte"],
        }

    def filter_by_min_sample_size(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen al menos el tamaño de muestra dado
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_min_sample_size_{value}"
        alleles_id = cache.get(cache_key)
        if alleles_id is None:
            self.allele_region_info = self.allele_region_info.filter(
                sample_size__gte=value
            )
            alleles_id = self.allele_region_info.values_list("region_id", flat=True)

            cache.set(cache_key, alleles_id, timeout=None)
        return queryset.filter(id__in=alleles_id)

    def filter_by_max_sample_size(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen como máximo el tamaño de muestra dado
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_max_sample_size_{value}"
        alleles_id = cache.get(cache_key)
        if alleles_id is None:
            self.allele_region_info = self.allele_region_info.filter(
                sample_size__lte=value
            )

            alleles_id = self.allele_region_info.values_list("region_id", flat=True)
            cache.set(cache_key, alleles_id, timeout=None)
        return queryset.filter(id__in=alleles_id)

    def filter_by_min_allele_frequency(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen al menos la frecuencia alélica dada
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_min_allele_frequency_{value}"
        alleles_id = cache.get(cache_key)
        if alleles_id is None:
            self.allele_region_info = self.allele_region_info.filter(
                allele_frequency__gte=value
            )

            alleles_id = self.allele_region_info.values_list("region_id", flat=True)
            cache.set(cache_key, alleles_id, timeout=None)
        return queryset.filter(id__in=alleles_id)

    def filter_by_max_allele_frequency(self, queryset, name, value):
        """
        Filtra las regiones con alelos que tienen como máximo la frecuencia alélica dada
        """
        if value is None:
            return queryset
        cache_key = f"filter_by_max_allele_frequency_{value}"
        alleles_id = cache.get(cache_key)
        if alleles_id is None:
            self.allele_region_info = self.allele_region_info.filter(
                allele_frequency__lte=value
            )
            alleles_id = self.allele_region_info.values_list("region_id", flat=True)
            cache.set(cache_key, alleles_id, timeout=None)
        return queryset.filter(id__in=alleles_id)

    def filter_by_country(self, queryset, name, value):
        """Filtra regiones cuyo campo 'population' comienza con el país indicado."""
        if not value:
            return queryset
        # Búsqueda insensible a mayúsculas al inicio del string
        return queryset.filter(population__istartswith=value)

    def filter_by_alleles_list(self, queryset, name, value):
        """
        Filtra regiones que contienen al menos uno de los alelos especificados.
        El parámetro 'value' es una cadena con nombres de alelos separados por comas.
        Ejemplo: ?alleles_list=A*01:01,A*02:01,B*07:02
        """
        if not value:
            return queryset

        # Dividir y limpiar la lista de alelos
        allele_names = [name.strip() for name in value.split(",") if name.strip()]
        if not allele_names:
            return queryset

        cache_key = f"alleles_list_filter_{'_'.join(sorted(allele_names))}"
        cached_data = cache.get(cache_key)

        if cached_data:
            allele_ids, region_ids = cached_data
        else:
            # Obtener IDs de los alelos exactos
            allele_ids = list(
                AlleleToMap.objects.filter(name__in=allele_names)
                .values_list("id", flat=True)
                .distinct()
            )
            if not allele_ids:
                return queryset.none()

            # Obtener regiones que tienen esos alelos (con frecuencias válidas)
            region_ids = list(
                self.allele_region_info.filter(allele_id__in=allele_ids)
                .values_list("region_id", flat=True)
                .distinct()
            )
            cache.set(cache_key, (allele_ids, region_ids), timeout=None)

        # Prefetch para traer SOLO los alelos de la lista
        filtered_queryset = queryset.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=AlleleRegionInfo.objects.filter(
                    allele_id__in=allele_ids,
                    allele_frequency__isnull=False,
                    allele_frequency__gt=0,
                )
                .select_related("allele", "allele__gene")
                .order_by("-allele_frequency"),
                to_attr="filtered_alleles",
            )
        )
        return filtered_queryset

    def filter_by_gene_name(self, queryset, name, value):
        if not value:
            return queryset
        cache_key = f"gene_filter_{value}"
        cached_data = cache.get(cache_key)
        if cached_data:
            allele_ids, region_ids = cached_data
        else:
            allele_ids = list(
                AlleleToMap.objects.filter(gene__name=value)
                .values_list("id", flat=True)
                .distinct()
            )
            region_ids = list(
                self.allele_region_info.filter(allele_id__in=allele_ids)
                .values_list("region_id", flat=True)
                .distinct()
            )
            cache.set(cache_key, (allele_ids, region_ids), timeout=3600)

        filtered_queryset = queryset.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=AlleleRegionInfo.objects.filter(
                    allele_id__in=allele_ids,
                    allele_frequency__isnull=False,
                    allele_frequency__gt=0,
                )
                .select_related("allele", "allele__gene")
                .order_by("-allele_frequency"),
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
