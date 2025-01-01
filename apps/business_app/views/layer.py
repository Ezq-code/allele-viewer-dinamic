from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.business_app.serializers.layer import LayerSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import Layer
from apps.business_app.serializers import AllowedExtensionsSerializer
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class LayerViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer
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

    permission_classes = [permissions.AllowAny]
