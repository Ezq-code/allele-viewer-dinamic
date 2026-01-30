import django_filters
from apps.business_app.models.gene import Gene
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from django.core.cache import cache


class GeneFilter(django_filters.FilterSet):
    """
    Filtro personalizado para Gene
    """

    allele_mapping = django_filters.NumberFilter(
        method="filter_by_allele_mapping", label="Allele Mapping ID"
    )

    class Meta:
        model = Gene
        fields = {
            "status": ["exact", "in"],
            "groups": ["exact", "in"],
            "disorders": ["exact", "in"],
        }

    def filter_by_allele_mapping(self, queryset, name, value):
        """
        Filtra las regiones que tienen alelos del gen especificado
        y aplica un Prefetch para mostrar solo los alelos de ese gen
        """
        if not value:
            return queryset

        # Generar clave de caché única
        cache_key = f"gene_by_allele_mapping_id_filter_{value}"

        # Intentar obtener del caché
        cached_data = cache.get(cache_key)

        if cached_data:
            gene_list_id = cached_data
        else:
            # Obtener los IDs de genes, alelos y regiones que coinciden
            gene_list_id = list(
                AlleleToMap.objects.filter(file_id=value).values_list(
                    "gene_id", flat=True
                )
            )

            cache.set(cache_key, gene_list_id, None)

        # Aplicar Prefetch para filtrar también los alelos relacionados
        filtered_queryset = queryset.filter(id__in=gene_list_id)

        return filtered_queryset
