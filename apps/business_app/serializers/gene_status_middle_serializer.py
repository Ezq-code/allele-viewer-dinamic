from rest_framework import serializers
from datetime import datetime
from apps.business_app.models.gene_status_middle import GeneStatusMiddle


class GeneStatusMiddleReadSerializer(serializers.ModelSerializer):
    gene = serializers.StringRelatedField(read_only=True)
    gene_status = serializers.StringRelatedField(read_only=True)
    gene_status_type = serializers.CharField(source="gene_status.type", read_only=True)
    gene_status_requires_evidence = serializers.BooleanField(
        source="gene_status.requires_evidence", read_only=True
    )
    updated_since = serializers.SerializerMethodField()

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
            "updated_timestamp",
            "updated_since",
        ]

    def get_updated_since(self, obj):
        last_updated = obj.updated_timestamp or obj.created_timestamp
        if not last_updated:
            return None
        now = datetime.now()
        naive_last_updated = last_updated.replace(tzinfo=None)

        time_difference = now - naive_last_updated
        return time_difference.days
