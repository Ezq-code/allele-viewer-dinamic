from rest_framework import serializers

from apps.business_app.models.initial_xyz_expansion_data import InitialXyzExpansionData


class InitialXyzExpansionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = InitialXyzExpansionData
        fields = [
            "x_value",
            "y_value",
            "z_value",
            "uploaded_file",
        ]
