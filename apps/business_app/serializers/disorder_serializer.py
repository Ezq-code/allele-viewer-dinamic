from rest_framework import serializers

from apps.business_app.models.disorder import Disorder


class DisorderSerializer(serializers.ModelSerializer):
    disease_subgroup = serializers.StringRelatedField()
    genes = serializers.StringRelatedField(many=True)

    class Meta:
        model = Disorder
        fields = [
            "id",
            "name",
            "description",
            "disease_subgroup",
            "genes",
        ]


class DisorderTableSerializer(serializers.ModelSerializer):
    disease_subgroup = serializers.StringRelatedField()
    disease_group = serializers.CharField(
        source="disease_subgroup.disease_group.name", read_only=True
    )

    class Meta:
        model = Disorder
        fields = [
            "id",
            "name",
            "disease_subgroup",
            "disease_group",
        ]
