from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, status
from rest_framework.generics import GenericAPIView
from apps.business_app.serializers.marker import MarkerSerializer
from apps.common.views import CommonOrderingFilter
from rest_framework.response import Response
from apps.business_app.models import Marker
from apps.business_app.serializers import AllowedExtensionsSerializer
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

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        results = []
        for marker in queryset:
            event_data = {
                "event_id": marker.event_type.id,
                "event_name": marker.event_type.event_name,
                "event_icon_url": request.build_absolute_uri(marker.event_type.event_icon.url),
            }

            marker_data = {
                "id": marker.id,
                "latitude": marker.latitude,
                "longitude": marker.longitude,
                "start_date": marker.start_date,
                "end_date": marker.end_date,
                "start_format": marker.get_start_format_display(),
                "end_format": marker.get_end_format_display(),
                "description": marker.description,
                "reference": marker.reference,
                "event_type": event_data,
            }
            results.append(marker_data)

        return Response(results, status=status.HTTP_200_OK)