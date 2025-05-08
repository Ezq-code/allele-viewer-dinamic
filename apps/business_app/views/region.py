from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets, permissions
from rest_framework.generics import GenericAPIView


from apps.business_app.models.region import Region
from apps.business_app.serializers.regions import RegionSerializer
from apps.common.views import CommonOrderingFilter


# Create your views here.


class RegionViewSet(viewsets.ModelViewSet, GenericAPIView):
    """ """

    queryset = Region.objects.prefetch_related("countries_for_region").all()
    serializer_class = RegionSerializer
    search_fields = [
        "name",
        "symbol",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes =  [permissions.AllowAny]
