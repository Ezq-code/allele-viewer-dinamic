from rest_framework import serializers

from apps.business_app.models.gene_status_middle import GeneStatusMiddle


class GeneStatusMiddleReadSerializer(serializers.ModelSerializer):
    gene=serializers.StringRelatedField(read_only=True)
    gene_status = serializers.StringRelatedField(read_only=True)
    gene_status_type = serializers.CharField(source="gene_status.type", read_only=True)
    gene_status_requires_evidence = serializers.BooleanField(
        source="gene_status.requires_evidence", read_only=True
    )

    class Meta:
        model = GeneStatusMiddle
        fields = [
            "id",
            "gene",
            "gene_status",
            "gene_status_type",
            "gene_status_requires_evidence",
            "evidence",
            "value",
        ]
