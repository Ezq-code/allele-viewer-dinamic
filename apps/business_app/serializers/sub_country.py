from rest_framework import serializers

from apps.business_app.models.sub_country import SubCountry


class SubCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCountry
        fields = [
            "id",
            "name",
            "country",
        ]
