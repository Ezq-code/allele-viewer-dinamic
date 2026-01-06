from rest_framework import serializers

from apps.business_app.models.disorder import Disorder


class DisorderSerializer(serializers.ModelSerializer):
    disease_subgroup_name = serializers.CharField(
        source="disease_subgroup.name", read_only=True
    )

    # CAMBIO: Para genes, devolver los IDs y nombres
    genes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    genes_names = serializers.SerializerMethodField()

    class Meta:
        model = Disorder
        fields = [
            "id",
            "name",
            "description",
            "disease_subgroup",  # ID del subgroup
            "disease_subgroup_name",  # Nombre del subgroup
            "genes",  # IDs de los genes
            "genes_names",  # Nombres de los genes
        ]

    def get_genes_names(self, obj):
        return [gene.name for gene in obj.genes.all()]


class DisorderTableSerializer(serializers.ModelSerializer):
    disease_subgroup = serializers.PrimaryKeyRelatedField(read_only=True)
    disease_subgroup_name = serializers.CharField(
        source="disease_subgroup.name", read_only=True
    )
    disease_group = serializers.CharField(
        source="disease_subgroup.disease_group.name", read_only=True
    )
    genes_names = serializers.SerializerMethodField()

    class Meta:
        model = Disorder
        fields = [
            "id",
            "name",
            "description",
            "disease_subgroup",
            "disease_subgroup_name",
            "disease_group",
            "genes_names",
        ]

    def get_genes_names(self, obj):
        return [gene.name for gene in obj.genes.all()]


# Serializer minimalista para los selects
class DisorderMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disorder
        fields = ["id", "name"]
