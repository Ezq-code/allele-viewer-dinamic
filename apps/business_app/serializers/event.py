from rest_framework import serializers


from apps.business_app.models.event import Event
from apps.business_app.serializers.event_gallery import EventGallerySerializer
from apps.business_app.serializers.event_type import EventTypeSerializer
from apps.business_app.serializers.marker import MarkerShortSerializer


class EventSerializer(serializers.ModelSerializer):
    event_type_info = EventTypeSerializer(source='event_type', read_only=True)
    markers = MarkerShortSerializer(many=True, read_only=True)
    event_gallery = EventGallerySerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "event_name",
            "event_icon",
            "pause_time",
            "description",
            "start_date",
            "end_date",
            "reference",
            "event_type",
            "event_type_info",
            "markers",
            "event_gallery",

        ]

