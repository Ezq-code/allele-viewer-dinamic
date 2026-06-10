from rest_framework import serializers

from apps.business_app.models import AlleleNode
from apps.business_app.serializers.base_allele_nodes import BaseAlleleNodeSerializer


class ChildSerializer(serializers.ModelSerializer):
    """Nested serializer for child allele nodes."""

    class Meta:
        model = AlleleNode
        fields = [
            "id",
            "number",
        ]
        read_only_fields = [
            "id",
            "number",
        ]


class AlleleNodeSerializer(BaseAlleleNodeSerializer):
    """Serializer for AlleleNode model with inherited graph-aware functionality."""

    class Meta(BaseAlleleNodeSerializer.Meta):
        model = AlleleNode
        fields = BaseAlleleNodeSerializer.Meta.fields
        read_only_fields = BaseAlleleNodeSerializer.Meta.read_only_fields
