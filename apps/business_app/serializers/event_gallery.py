from rest_framework import serializers


from apps.business_app.models.event_gallery import EventGallery


class EventGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventGallery
        fields = ["id", "name", "event", "image"]
