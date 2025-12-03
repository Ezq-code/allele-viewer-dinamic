from rest_framework import serializers

from apps.business_app.models.disease_subgroup import DiseaseSubGroup


class DiseaseSubGroupSerializer(serializers.ModelSerializer):
    disorders = serializers.StringRelatedField(many=True, read_only=True)
    disease_group_name = serializers.CharField(source='disease_group.name', read_only=True)

    class Meta:
        model = DiseaseSubGroup
        fields = [
            "id",
            "name",
            "description",
            "disorders",
            "disease_group",  # ID del disease group
            "disease_group_name",  # Nombre del disease group
        ]
        read_only_fields = ["disorders", "disease_group_name"]


# Si necesitas un serializer minimalista para los selects
class DiseaseSubGroupMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseSubGroup
        fields = ["id", "name"]
