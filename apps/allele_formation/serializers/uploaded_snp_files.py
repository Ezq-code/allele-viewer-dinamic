
from rest_framework import serializers
from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles


class UploadedSNPFileSerializer(serializers.ModelSerializer):
    gene_name = serializers.CharField(read_only=True)

    class Meta:
        model = UploadedSNPFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "snp_file",
            "system_user",
            "gene",
            "gene_name",
            "predefined",
        ]

    def save(self, **kwargs):
        try:
            return super().save(**kwargs)
        except Exception as e:
            raise serializers.ValidationError(e) from e
