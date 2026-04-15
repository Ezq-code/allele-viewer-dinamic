import django_filters
from ..models.caracteristica_gen import CaracteristicaGen

class CaracteristicaGenFilter(django_filters.FilterSet):
    gen_name = django_filters.CharFilter(field_name='gen__name', lookup_expr='exact')
    cord = django_filters.CharFilter(lookup_expr='exact')
    cord__icontains = django_filters.CharFilter(field_name='cord', lookup_expr='icontains')
    
    class Meta:
        model = CaracteristicaGen
        fields = {
            'gen__name': ['exact'],
            'cord': ['exact'],    
        }
