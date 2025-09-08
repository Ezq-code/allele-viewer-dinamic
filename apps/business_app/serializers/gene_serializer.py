from rest_framework import serializers


from apps.business_app.models.gene import Gene


class GeneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gene
        fields = [
            "id",
            "name",
            "description",
            "status",
        ]


class GeneGetOneSerializer(GeneSerializer):
    class Meta(GeneSerializer.Meta):
        fields = GeneSerializer.Meta.fields + ["formation"]
