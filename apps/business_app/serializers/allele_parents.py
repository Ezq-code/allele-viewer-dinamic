from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.allele_node import AlleleNode


class AlleleParentsSerializer(serializers.Serializer):
    pdb = serializers.PrimaryKeyRelatedField(
        required=True, queryset=PdbFiles.objects.all()
    )
    allele_node = serializers.PrimaryKeyRelatedField(
        required=True, queryset=AlleleNode.objects.all()
    )
