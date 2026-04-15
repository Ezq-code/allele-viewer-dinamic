from rest_framework import serializers
from ..models.caracteristica_gen import CaracteristicaGen


class CaracteristicaGenCoordinatesSerializer(serializers.ModelSerializer):
    """
    Serializer específico para devolver solo los campos necesarios
    basados en gen y coordenadas
    """

    Coordinate = serializers.CharField(source="cord", read_only=True)
    Gene = serializers.CharField(source="gen.name", read_only=True)

    Valor = serializers.CharField(source="valor")
    Color = serializers.CharField(source="color", read_only=True)
    Protein = serializers.CharField(source="protein", read_only=True)
    Alleleasoc = serializers.CharField(source="alleleasoc", read_only=True)
    Species = serializers.CharField(source="species", read_only=True)
    Variant = serializers.CharField(source="variant", read_only=True)
    Order1 = serializers.CharField(source="order_one", read_only=True)
    Order2 = serializers.CharField(source="order_two", read_only=True)
    Order3 = serializers.CharField(source="order_three", read_only=True)

    class Meta:
        model = CaracteristicaGen
        fields = [
            "Gene",
            "Coordinate",
            "Valor",
            "Color",
            "Protein",
            "Alleleasoc",
            "Species",
            "Variant",
            "Order1",
            "Order2",
            "Order3",
        ]
