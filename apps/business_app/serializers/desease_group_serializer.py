from rest_framework import serializers

from apps.business_app.models.desease_group import DeseaseGroup
from apps.business_app.models.gene import Gene
from apps.business_app.serializers.gene_group_middle_serializer import GeneStatusMiddleSerializer


class DeseaseGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeseaseGroup
        fields = [
            "id",
            "name",
            "description",
        ]
