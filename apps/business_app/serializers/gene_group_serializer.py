from rest_framework import serializers

from apps.business_app.models.gene_group import GeneGroups


class GeneGroupsSerializer(serializers.ModelSerializer):
    genes = serializers.StringRelatedField(many=True)

    class Meta:
        model = GeneGroups
        fields = [
            "id",
            "name",
            "description",
            "genes",
        ]
