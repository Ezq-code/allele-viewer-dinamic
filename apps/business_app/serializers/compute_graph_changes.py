from rest_framework import serializers

from apps.business_app.models import ComputeGraphChanges
import logging

from apps.business_app.serializers.pdb_files import PdbFilesSerializer

logger = logging.getLogger(__name__)


class ComputeGraphChangesSerializer(serializers.ModelSerializer):
    pdb_files = PdbFilesSerializer(many=True, read_only=True)

    class Meta:
        model = ComputeGraphChanges
        fields = [
            "id",
            "custom_name",
            "description",
            "original_file",
            "system_user",
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
            raise serializers.ValidationError(e)