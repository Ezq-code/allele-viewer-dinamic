from rest_framework import serializers


from apps.business_app.models.event_type import EventType


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = [
            "id",
            "name",
            "icon",
            "pause_time",
        ]
