from rest_framework import serializers

from apps.business_app.models.gene import Gene
from apps.business_app.serializers.gene_group_middle_serializer import (
    GeneStatusMiddleSerializer,
)


class GeneSerializer(serializers.ModelSerializer):
    gene_status_list = GeneStatusMiddleSerializer(many=True)

    class Meta:
        model = Gene
        fields = [
            "id",
            "name",
            "description",
            "status",
            "groups",
            "gene_status_list",
        ]
