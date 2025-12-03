from rest_framework import serializers

from apps.business_app.models.disease_group import DiseaseGroup



class DiseaseGroupSerializer(serializers.ModelSerializer):
   

    class Meta:
        model = DiseaseGroup
        fields = [
            "id",
            "name",
            "description",
        ]


