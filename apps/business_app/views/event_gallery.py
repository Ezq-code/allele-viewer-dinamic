from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from apps.business_app.serializers.event_gallery import EventGallerySerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import EventGallery
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class EventGalleryViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = EventGallery.objects.all()
    serializer_class = EventGallerySerializer
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
