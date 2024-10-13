from email.policy import default
from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.site_configurations import SiteConfiguration

class AlleleInputSerializer(serializers.Serializer):
    id_pdb = serializers.IntegerField(required=True)
    id_allele = serializers.IntegerField(required=True)

    def validate(self, attrs):
        id_pdb = attrs.get("id_pdb")
        id_allele = attrs.get("id_allele")

        if id_pdb is not None and id_allele is not None and (id_pdb or id_allele) < 0:
            raise serializers.ValidationError("Incorrect values for input parameters")
        
        return attrs

