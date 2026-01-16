import django_filters
from django.db.models import Q
from apps.allele_mapping.models.allele_region import AlleleRegion
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo


class AlleleRegionFilter(django_filters.FilterSet):
    """
    Filtro personalizado para AlleleRegion
    """
    
    gene_name = django_filters.CharFilter(method="filter_by_gene_name", label="Gene Name")

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
        """
        if not value:
            return queryset
        
        # Obtener los IDs de las regiones que tienen alelos del gen buscado
        region_ids = AlleleRegionInfo.objects.filter(
            allele__gene__name=value
        ).values_list('region_id', flat=True).distinct()
        
        return queryset.filter(id__in=region_ids)
