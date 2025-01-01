from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from apps.business_app.serializers.marker import MarkerSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import Marker
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class MarkerViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "description",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.AllowAny]
