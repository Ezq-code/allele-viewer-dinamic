from rest_framework import serializers

from apps.business_app.models import SiteConfiguration


class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = [
            "viewer_representation_mode",
            "example_file",
        ]
