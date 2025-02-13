from rest_framework import serializers
from apps.business_app.models.marker import Marker
from apps.business_app.serializers.marker_gallery import MarkerGallerySerializer


class MarkerSerializer(serializers.ModelSerializer):
    event_type_data = serializers.SerializerMethodField(
        method_name="get_event_type", read_only=True
    )
    marker_galleries = MarkerGallerySerializer(many=True, read_only=True)

    class Meta:
        model = Marker
        fields = [
            "id",
            "latitude",
            "longitude",
            "start_date",
            "end_date",
            "start_format",
            "end_format",
            "description",
            "reference",
            "pause_time",
            "event_type",
            "event_type_data",
            "marker_galleries",
        ]

    def get_event_type(self, obj):
        request = self.context.get("request")
        event_data = {
            "event_id": obj.event_type.id,
            "event_name": obj.event_type.event_name,
            "event_pause_time": obj.event_type.pause_time,
            "event_icon_url": request.build_absolute_uri(obj.event_type.event_icon.url)
            if request
            else obj.event_type.event_icon.url,
        }
        return event_data
