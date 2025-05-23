from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.business_app.models.event_type import EventType
from apps.business_app.serializers.event_type import EventTypeSerializer
from apps.common.views import CommonOrderingFilter
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class EventTypeViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "event_name",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.AllowAny]
