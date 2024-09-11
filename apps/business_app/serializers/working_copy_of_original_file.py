from rest_framework import serializers

import logging

from apps.business_app.models.working_copy_of_original_file import (
    WorkingCopyOfOriginalFile,
)

logger = logging.getLogger(__name__)


class WorkingCopyOfOriginalFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingCopyOfOriginalFile
        fields = [
            "id",
            "system_user",
            "uploaded_file",
            "pdb_file_copy",
            "google_sheet_id_copy",
            "created_at",
        ]
        read_only_fields = [
            "id",
        ]
