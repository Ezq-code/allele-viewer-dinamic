from rest_framework import serializers

from apps.users_app.models.country import Country


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = [
            "id",
            "name",
            "code",
            "enabled",
        ]
