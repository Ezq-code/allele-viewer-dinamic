from rest_framework import serializers
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.business_app.models.gene import Gene


class AlleleToMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleToMap
        fields = "__all__"


class AlleleToMapDetailSerializer(serializers.ModelSerializer):
    gene_name = serializers.CharField(source='gene.name', read_only=True)

    class Meta:
        model = AlleleToMap
        fields = ['id', 'name', 'gene_name']


class GeneListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar genes
    """
    class Meta:
        model = Gene  # Asegúrate de importar el modelo Gene
        fields = ['id', 'name']