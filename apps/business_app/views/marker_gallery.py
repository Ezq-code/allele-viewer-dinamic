from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from apps.business_app.serializers.marker_gallery import MarkerGallerySerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import MarkerGallery
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class MarkerGalleryViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = MarkerGallery.objects.all()
    serializer_class = MarkerGallerySerializer
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
