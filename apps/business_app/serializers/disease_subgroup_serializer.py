from rest_framework import serializers

from apps.business_app.models.disease_subgroup import DiseaseSubGroup


class DiseaseSubGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseSubGroup
        fields = [
            "id",
            "name",
            "description",
            "disease_group",
        ]
