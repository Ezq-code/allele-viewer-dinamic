from rest_framework import serializers

from apps.business_app.models import UploadedFiles
import logging

from apps.business_app.serializers.pdb_files import PdbFilesSerializer

logger = logging.getLogger(__name__)


class UploadedFilesSerializer(serializers.ModelSerializer):
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    gene_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UploadedFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "original_file",
            "system_user",
            "gene",
            "gene_name",
            "pdb_files",
        ]
        read_only_fields = [
            "id",
        ]

    def save(self):
        try:
            return super().save()
        except Exception as e:
            logger.error(f"{str(e)}")
            raise serializers.ValidationError(e) from e

    def get_gene_name(self, obj):
        return obj.gene.name if obj.gene else None
