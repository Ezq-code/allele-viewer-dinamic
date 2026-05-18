from rest_framework import serializers

from apps.business_app.models import ProteinNode
from apps.business_app.serializers.base_allele_nodes import BaseAlleleNodeSerializer


class ChildProteinNodeSerializer(serializers.ModelSerializer):
    """Nested serializer for child protein nodes."""

    class Meta:
        model = ProteinNode
        fields = [
            "id",
            "number",
        ]
        read_only_fields = [
            "id",
            "number",
        ]


class ProteinNodeSerializer(BaseAlleleNodeSerializer):
    """Serializer for ProteinNode model with inherited graph-aware functionality."""

    class Meta(BaseAlleleNodeSerializer.Meta):
        model = ProteinNode
        fields = BaseAlleleNodeSerializer.Meta.fields + [
            "is_final_for_allele",
        ]
        read_only_fields = list(BaseAlleleNodeSerializer.Meta.read_only_fields) + [
            "is_final_for_allele",
        ]
