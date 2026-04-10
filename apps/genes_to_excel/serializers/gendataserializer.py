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
<<<<<<< Updated upstream
            "order",  # Updated fiel
=======
            'order_one',
            'order_two', 
            'order_three'
>>>>>>> Stashed changes
            "fecha_creacion",
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]
