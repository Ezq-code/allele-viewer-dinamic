from rest_framework import serializers

from apps.business_app.models import AllowedExtensions


class AllowedExtensionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowedExtensions
        fields = [
            "id",
            "extension",
            "typical_app_name",
        ]
