from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.business_app.serializers.event import EventSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import Event
from apps.business_app.serializers import AllowedExtensionsSerializer
from apps.common.pagination import AllResultsSetPagination

# Create your views here.


class EventViewSet(viewsets.ModelViewSet, GenericAPIView):

    queryset = Event.objects.all()
    serializer_class = EventSerializer
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
