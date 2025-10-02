from rest_framework import serializers

from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.serializers.gene_group_middle_serializer import (
    GeneStatusMiddleReadSerializer,
)


class GeneSerializer(serializers.ModelSerializer):
    gene_status_list = serializers.SerializerMethodField()
    groups = serializers.StringRelatedField(many=True)
    disorders = serializers.StringRelatedField(many=True)

    class Meta:
        model = Gene
        fields = [
            "id",
            "name",
            "description",
            "status",
            "groups",
            "disorders",
            "gene_status_list",
        ]

    def get_gene_status_list(self, obj):
        return GeneStatusMiddleReadSerializer(
            GeneStatusMiddle.objects.filter(gene=obj).select_related("gene_status"),
            many=True,
        ).data
