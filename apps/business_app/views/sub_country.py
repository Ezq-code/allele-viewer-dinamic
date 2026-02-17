from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.business_app.models.sub_country import SubCountry
from apps.business_app.serializers.sub_country import SubCountrySerializer
from apps.common.views import CommonOrderingFilter
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class SubCountryViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = SubCountry.objects.all()
    serializer_class = SubCountrySerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = [
        "country",
    ]

    permission_classes = [permissions.AllowAny]
