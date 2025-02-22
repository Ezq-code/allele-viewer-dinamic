from rest_framework import serializers


from apps.business_app.models.event import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "event_name",
            "event_icon",
            "pause_time",
        ]
