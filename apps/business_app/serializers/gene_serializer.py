from rest_framework import serializers
from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.models.disorder import Disorder
from apps.business_app.serializers.disorder_serializer import (
    DisorderTableSerializer,
)
from apps.business_app.serializers.gene_status_middle_serializer import (
    GeneStatusMiddleReadSerializer,
)


class GeneSerializer(serializers.ModelSerializer):
    gene_status_list = GeneStatusMiddleReadSerializer(many=True, read_only=True)

    # Campos de solo lectura para mostrar nombres
    groups_names = serializers.StringRelatedField(many=True, source="groups", read_only=True)
    disorders_names = serializers.StringRelatedField(many=True, source="disorders", read_only=True)

    # Campos para escritura (IDs)
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=GeneGroups.objects.all(),
        required=False
    )
    disorders = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Disorder.objects.all(),
        required=False
    )

    class Meta:
        model = Gene
        fields = [
            "id",
            "name",
            "description",
            "status",
            "groups_names",
            "disorders_names",
            "groups",
            "disorders",
            "gene_status_list",
        ]
        read_only_fields = ["status"]  # Status no editable


class GeneGetAllInfoSerializer(serializers.ModelSerializer):
    disorders = DisorderTableSerializer(many=True)

    class Meta:
        model = Gene
        fields = [
            "id",
            "name",
            "disorders",
        ]
