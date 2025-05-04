from rest_framework import serializers

from apps.business_app.models.region import Region


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = (
            "name",
            "symbol",
            "color",
        )
