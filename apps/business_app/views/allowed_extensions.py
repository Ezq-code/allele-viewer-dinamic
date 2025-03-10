from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.common.views import CommonOrderingFilter
from apps.business_app.models import AllowedExtensions
from apps.business_app.serializers import AllowedExtensionsSerializer

# Create your views here.


class AllowedExtensionsViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows file upload extensions added or edited.
    """

    queryset = AllowedExtensions.objects.all()
    serializer_class = AllowedExtensionsSerializer
    search_fields = [
        "extension",
        "typical_app_name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
