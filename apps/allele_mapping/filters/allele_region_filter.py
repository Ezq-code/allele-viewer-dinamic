import django_filters
from django.db.models import Prefetch, Q
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from django.core.cache import cache


class AlleleRegionFilter(django_filters.FilterSet):
    gene_name = django_filters.CharFilter(
        method="filter_by_gene_name",
        label="Gene Name"
    )
    alleles_list = django_filters.CharFilter(
        method="filter_by_alleles_list",
        label="Alleles list (comma separated)"
    )
    country = django_filters.CharFilter(
        method="filter_by_country",
        label="Country (subcountry name)"
    )
    min_allele_frequency = django_filters.NumberFilter(
        method="filter_by_min_allele_frequency",
        label="Min allele frequency (percentage)"
    )
    max_allele_frequency = django_filters.NumberFilter(
        method="filter_by_max_allele_frequency",
        label="Max allele frequency (percentage)"
    )
    min_sample_size = django_filters.NumberFilter(
        method="filter_by_min_sample_size",
        label="Min sample size"
    )
    max_sample_size = django_filters.NumberFilter(
        method="filter_by_max_sample_size",
        label="Max sample size"
    )
    kind_of_info = django_filters.ChoiceFilter(
        choices=AlleleRegionInfo.KIND_OF_INFO.choices,
        method="filter_by_kind_of_info",
        label="Kind of info (P=Primary, S=Secondary)"
    )

    class Meta:
        model = AlleleRegion
        fields = {
            "id": ["exact", "in"],
            "coordinates__lat": ["gte", "lte"],
            "coordinates__lon": ["gte", "lte"],
            "alleles__percent_of_individuals": ["gte", "lte"],
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Almacenamos las condiciones para filtrar AlleleRegionInfo
        self.allele_filters = Q()
        # Para la optimización, guardamos los IDs de alelos cuando sea posible
        self.allele_ids_set = False
        self.allele_ids = None

    # --------------------------------------------------------------
    # Métodos que acumulan condiciones (sin aplicar prefetch)
    # --------------------------------------------------------------
    def filter_by_gene_name(self, queryset, name, value):
        if not value:
            return queryset
        # Obtener IDs de alelos para el gen (con caché)
        cache_key = f"gene_filter_{value}"
        allele_ids = cache.get(cache_key)
        if allele_ids is None:
            allele_ids = list(
                AlleleToMap.objects.filter(gene__name=value)
                .values_list("id", flat=True)
                .distinct()
            )
            cache.set(cache_key, allele_ids, timeout=3600)
        if not allele_ids:
            self.allele_filters &= Q(pk__isnull=True)  # fuerza vacío
        else:
            self.allele_filters &= Q(allele_id__in=allele_ids)
            self._store_allele_ids(allele_ids)
        return queryset

    def filter_by_alleles_list(self, queryset, name, value):
        if not value:
            return queryset
        allele_names = [n.strip() for n in value.split(",") if n.strip()]
        if not allele_names:
            return queryset
        cache_key = f"alleles_list_{'_'.join(sorted(allele_names))}"
        allele_ids = cache.get(cache_key)
        if allele_ids is None:
            allele_ids = list(
                AlleleToMap.objects.filter(name__in=allele_names)
                .values_list("id", flat=True)
                .distinct()
            )
            cache.set(cache_key, allele_ids, timeout=None)
        if not allele_ids:
            self.allele_filters &= Q(pk__isnull=True)
        else:
            self.allele_filters &= Q(allele_id__in=allele_ids)
            self._store_allele_ids(allele_ids)
        return queryset

    def filter_by_kind_of_info(self, queryset, name, value):
        if not value:
            return queryset
        self.allele_filters &= Q(kind_of_info=value)
        return queryset

    def filter_by_min_sample_size(self, queryset, name, value):
        if value is None:
            return queryset
        self.allele_filters &= Q(sample_size__gte=value)
        return queryset

    def filter_by_max_sample_size(self, queryset, name, value):
        if value is None:
            return queryset
        self.allele_filters &= Q(sample_size__lte=value)
        return queryset

    def filter_by_min_allele_frequency(self, queryset, name, value):
        if value is None:
            return queryset
        self.allele_filters &= Q(allele_frequency__gte=value)
        return queryset

    def filter_by_max_allele_frequency(self, queryset, name, value):
        if value is None:
            return queryset
        self.allele_filters &= Q(allele_frequency__lte=value)
        return queryset

    def filter_by_country(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(sub_country__name__iexact=value)

    # --------------------------------------------------------------
    # Método auxiliar para almacenar allele_ids (intersección)
    # --------------------------------------------------------------
    def _store_allele_ids(self, ids):
        if self.allele_ids_set:
            # Si ya existen IDs, hacer interseccion
            self.allele_ids = list(set(self.allele_ids) & set(ids))
        else:
            self.allele_ids = ids
            self.allele_ids_set = True

    # --------------------------------------------------------------
    # Sobrescritura de filter_queryset: aquí se aplica el prefetch único
    # --------------------------------------------------------------
    def filter_queryset(self, queryset):
        # 1. Aplicar filtros básicos (los que no afectan a AlleleRegionInfo)
        queryset = super().filter_queryset(queryset)

        # 2. Si no hay filtros sobre AlleleRegionInfo, se devuelve el queryset sin prefetch extra
        if not self.allele_filters and not self.allele_ids_set:
            return queryset

        # 3. Construir el queryset base de AlleleRegionInfo (solo registros válidos)
        base_qs = AlleleRegionInfo.objects.filter(
            allele_frequency__isnull=False,
            allele_frequency__gt=0,
            sample_size__gt=0
        )

        # 4. Aplicar todas las condiciones acumuladas
        if self.allele_filters:
            base_qs = base_qs.filter(self.allele_filters)

        # 5. Si tenemos allele_ids precalculados, añadimos ese filtro
        if self.allele_ids_set and self.allele_ids:
            base_qs = base_qs.filter(allele_id__in=self.allele_ids)

        # 6. Obtener los IDs de región que tienen al menos un alelo que cumpla
        region_ids = list(base_qs.values_list("region_id", flat=True).distinct())
        if not region_ids:
            return queryset.none()

        # 7. Aplicar un único prefetch con el queryset filtrado
        queryset = queryset.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=base_qs.select_related("allele", "allele__gene")
                         .order_by("-allele_frequency"),
                to_attr="filtered_alleles"
            )
        )
        return queryset

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
