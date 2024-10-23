from rest_framework import serializers

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.uploaded_files import UploadedFiles


class AlleleParentsSerializer(serializers.Serializer):
    uploaded_file = serializers.PrimaryKeyRelatedField(
        queryset=UploadedFiles.objects.all(), required=True
    )    
    # pdb = serializers.IntegerField(required=True
    # )
    allele_node = serializers.IntegerField(required=True)

    # def validate_pdb(self, value):
    #     exists = PdbFiles.objects.filter(id=value).exists()
    #     if not exists:
    #         raise serializers.ValidationError("PDB File not found")
    #     return value

    # def validate_allele_node(self, value):
    #     exists = AlleleNode.objects.filter(id=value).exists()
    #     if not exists:
    #         raise serializers.ValidationError("Allele Node not found")
    #     return value
