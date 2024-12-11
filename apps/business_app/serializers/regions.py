from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.region import Region


class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Region
        fields=("name", )