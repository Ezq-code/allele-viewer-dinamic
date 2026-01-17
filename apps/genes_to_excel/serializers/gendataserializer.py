from rest_framework import serializers
from ..models.gen_data import CaracteristicaGen


class GenDataSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="gen.name", read_only=True)

    class Meta:
        model = CaracteristicaGen
        fields = [
            "id",
            "gen",
            "name",
            "archivo_origen",
            "gene",
            "cord",
            "valor",
            "color",
            "protein",
            "alleleasoc",
            "variant",
            "species",
            "fecha_creacion",
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]
