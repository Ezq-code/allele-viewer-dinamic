from numpy import source
from rest_framework import serializers
from apps.business_app.models.feature import Feature


class FeatureSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Feature
        fields = [
            "id",
            "feature_id",
            "title",
            "mag",
            "place",
            "time",
            "timefinal",
            "latitude",
            "longitude",
        ]

    def get_latitude(self, obj):
        return obj.coordinates[1] if obj.coordinates else None

    def get_longitude(self, obj):
        return obj.coordinates[0] if obj.coordinates else None
