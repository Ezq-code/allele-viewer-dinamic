from rest_framework import serializers

from apps.business_app.models import InitialFileData


class InitialFileDataSerializer(serializers.ModelSerializer):
    current_percent = serializers.SerializerMethodField()

    class Meta:
        model = InitialFileData
        fields = [
            "id",
            "allele",
            "marker",
            "original_value",
            "current_percent",
        ]
        read_only_fields = [
            "id",
            "allele",
            "marker",
            "current_percent",
        ]

    def get_current_percent(self, obj):
        return (
            (obj.original_value - obj.min_value) * 100 / (obj.max_value - obj.min_value)
        )
