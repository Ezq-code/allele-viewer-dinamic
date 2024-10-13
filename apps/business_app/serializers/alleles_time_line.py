from email.policy import default
from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.site_configurations import SiteConfiguration

class AlleleInputDateSerializer(serializers.Serializer):
    id_pdb = serializers.IntegerField(required=True)
    date = serializers.DateField(required=True)

    def validate(self, attrs):
        id_pdb = attrs.get("id_pdb")
        date = attrs.get("date")

        if id_pdb is None and date is not None and id_pdb <= 0:
            raise serializers.ValidationError("Incorrect values for input parameters")
        
        return attrs