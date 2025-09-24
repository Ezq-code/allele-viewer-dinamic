from rest_framework import serializers

from apps.business_app.models.disease_group import DiseaseGroup
from apps.business_app.models.disorder import Disorder


class DisorderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disorder
        fields = [
            "id",
            "name",
            "description",
            "disease_subgroup",
        ]
