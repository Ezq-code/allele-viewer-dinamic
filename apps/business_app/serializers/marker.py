from rest_framework import serializers
from apps.business_app.models.marker import Marker
from apps.business_app.models.event import Event


class MarkerSerializer(serializers.ModelSerializer):
    event_type = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    event_type_data = serializers.SerializerMethodField(
        method_name="get_event_type", read_only=True
    )

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
            "event_type",
            "event_type_data",
        ]

    def get_event_type(self, obj):
        request = self.context.get("request")
        event_data = {
            "event_id": obj.event_type.id,
            "event_name": obj.event_type.event_name,
            "event_icon_url": request.build_absolute_uri(obj.event_type.event_icon.url)
            if request
            else obj.event_type.event_icon.url,
        }
        return event_data
