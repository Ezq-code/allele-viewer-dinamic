from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from apps.business_app.serializers.event_gallery import EventGallerySerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import EventGallery, Event
from apps.common.pagination import AllResultsSetPagination
# para manejar multiples imagenes
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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

    @action(detail=False, methods=['post'], url_path='bulk-upload/(?P<event_id>[^/.]+)')
    def bulk_upload(self, request, event_id=None):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Se asume que las imágenes vienen como una lista en el campo 'images'
        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {"error": "No images provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = []
        for image in images:
            data.append({
                "event": event.id,
                "image": image,
                "name": image.name  # Opcional
            })

        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {"message": f"{len(images)} images uploaded successfully"},
            status=status.HTTP_201_CREATED
        )