from rest_framework import serializers

from apps.business_app.models.disease_subgroup import DiseaseSubGroup


class DiseaseSubGroupSerializer(serializers.ModelSerializer):
    disorders = serializers.StringRelatedField(many=True)

    class Meta:
        model = DiseaseSubGroup
        fields = [
            "id",
            "name",
            "description",
            "disorders",
            "disease_group",
        ]
