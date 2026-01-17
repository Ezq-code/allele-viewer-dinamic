from rest_framework import serializers


class GenFiltroSerializer(serializers.Serializer):
    gene = serializers.CharField(required=False)
    species = serializers.CharField(required=False)
    valor = serializers.CharField(required=False)
    archivo_origen = serializers.CharField(required=False)
