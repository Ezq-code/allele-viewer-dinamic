import django_filters
from django.db.models import Prefetch
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.business_app.models.gene import Gene
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from django.core.cache import cache


class AlleleRegionFilter(django_filters.FilterSet):
    """
    Filtro personalizado para AlleleRegion
    """

    gene_name = django_filters.CharFilter(
        method="filter_by_gene_name", label="Gene Name"
    )

    class Meta:
        model = AlleleRegion
        fields = {
            "id": ["exact", "in"],
            "lat": ["gte", "lte"],
            "lon": ["gte", "lte"],
            "alleles__sample_size": ["gte", "lte"],
            "alleles__allele_frequency": ["gte", "lte"],
            "alleles__percent_of_individuals": ["gte", "lte"],
        }

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
            region_ids = cached_data
        else:
            # Obtener los IDs de genes, alelos y regiones que coinciden
            gene_list = list(
                Gene.objects.filter(name=value).values_list("id", flat=True)
            )
            allele_list = list(
                AlleleToMap.objects.filter(gene_id__in=gene_list).values_list(
                    "id", flat=True
                )
            )
            region_ids = list(
                AlleleRegionInfo.objects.filter(allele_id__in=allele_list)
                .values_list("region_id", flat=True)
                .distinct()
            )

            cache.set(cache_key, region_ids, None)

        # Aplicar Prefetch para filtrar también los alelos relacionados
        filtered_queryset = queryset.filter(id__in=region_ids).prefetch_related(
            Prefetch(
                "alleles",
                queryset=AlleleRegionInfo.objects.filter(
                    allele_id__in=allele_list,
                    percent_of_individuals__isnull=False,
                    percent_of_individuals__gt=0,
                ).select_related("allele", "allele__gene"),
                to_attr="filtered_alleles",
            )
        )

        return filtered_queryset
