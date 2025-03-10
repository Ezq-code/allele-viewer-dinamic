from rest_framework import serializers

from apps.business_app.models.layer import Layer


class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = [
            "id",
            "name",
            "is_visible",
        ]
