from rest_framework import serializers
from ..models.caracteristica_gen import CaracteristicaGen


class CaracteristicaGenSerializer(serializers.ModelSerializer):
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
            "order_one",
            "order_two",
            "order_three",
            "fecha_creacion",
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]
