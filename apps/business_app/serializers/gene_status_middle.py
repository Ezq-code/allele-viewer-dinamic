from rest_framework import serializers
from datetime import datetime
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from typing import Optional


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

    def get_updated_since(self, obj) -> Optional[int]:
        last_updated = obj.updated_timestamp or obj.created_timestamp
        if not last_updated:
            return None
        now = datetime.now()
        naive_last_updated = last_updated.replace(tzinfo=None)

        time_difference = now - naive_last_updated
        return time_difference.days


class GeneStatusMiddleWriteSerializer(serializers.ModelSerializer):
    """Serializer para actualizar value y evidence de GeneStatusMiddle"""
    
    def validate_value(self, value):
        """Validar que el valor no supere 100"""
        if value > 100:
            raise serializers.ValidationError("Value cannot exceed 100%")
        if value < 0:
            raise serializers.ValidationError("Value cannot be negative")
        return value

    class Meta:
        model = GeneStatusMiddle
        fields = ["value", "evidence"]

