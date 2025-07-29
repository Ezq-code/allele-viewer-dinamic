from rest_framework import serializers
from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles


class UploadedSNPFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedSNPFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "snp_file",
            "system_user",
        ]
