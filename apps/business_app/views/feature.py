from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from apps.business_app.serializers.feature import FeatureSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import Feature
from apps.business_app.serializers import AllowedExtensionsSerializer
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class FeatureViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "__all__",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(geometry_type='Point')
        results = []
        for feature in queryset:
            # Extraer longitud y latitud de las coordenadas
            if feature.coordinates:
                longitude = feature.coordinates[0]
                latitude = feature.coordinates[1]
            else:
                longitude = None
                latitude = None

            # Agregar la información deseada a los resultados
            results.append({
                'id': feature.id,
                'feature_id': feature.feature_id,
                'mag': feature.mag,
                'place': feature.place,
                'time': feature.time,
                'title': feature.title,
                'timefinal': feature.timefinal,
                'longitude': longitude,
                'latitude': latitude,
            })

        return Response(results, status=status.HTTP_200_OK)
