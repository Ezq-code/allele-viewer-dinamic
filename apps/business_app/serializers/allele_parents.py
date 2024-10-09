from email.policy import default
from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.site_configurations import SiteConfiguration

class AlleleParentSerializer(serializers.Serializer):
    id_allele = serializers.IntegerField(required=True)

class AlleleInputSerializer(serializers.Serializer):
    id_pdb = serializers.IntegerField(required=True)
    id_allele = serializers.IntegerField(required=True)

