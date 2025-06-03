from rest_framework import serializers


from apps.business_app.models.event_gallery import EventGallery


class MultipleEventGallerySerializer(serializers.ListSerializer):
    def create(self, validated_data):
        images = [EventGallery(**item) for item in validated_data]
        return EventGallery.objects.bulk_create(images)


class EventGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventGallery
        fields = ["id", "name", "event", "image"]
        list_serializer_class = MultipleEventGallerySerializer