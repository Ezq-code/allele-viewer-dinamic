from rest_framework import serializers

from apps.business_app.models.gene_status import GeneStatus


class GeneStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneStatus
        fields = [
            "id",
            "name",
            "description",
            "type",
            "requires_evidence",
        ]
