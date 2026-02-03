from rest_framework import serializers

from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry
from typing import List


class RegionSerializer(serializers.ModelSerializer):
    countries = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = (
            "symbol",
            "name",
            "color",
            "countries",
        )

    def get_countries(self, obj) -> List[str]:
        return list(
            RegionCountry.objects.filter(region=obj.id).values_list(
                "country__code", flat=True
            )
        )
