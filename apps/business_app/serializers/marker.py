from rest_framework import serializers
from apps.business_app.models.marker import Marker


class MarkerSerializer(serializers.ModelSerializer):
    # marker_galleries = MarkerGallerySerializer(many=True, read_only=True)
    class Meta:
        model = Marker
        fields = [
            "id",
            "latitude",
            "longitude",
            "event",
            # "marker_galleries",
        ]


class MarkerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marker
        fields = [
            "latitude",
            "longitude",
        ]
