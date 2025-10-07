from rest_framework import serializers

from apps.business_app.models.disease_group import DiseaseGroup
from apps.business_app.serializers.disease_subgroup_serializer import (
    DiseaseSubGroupSerializer,
)


class DiseaseGroupSerializer(serializers.ModelSerializer):
    subgroups = DiseaseSubGroupSerializer(many=True)

    class Meta:
        model = DiseaseGroup
        fields = [
            "id",
            "name",
            "description",
            "subgroups",
        ]
