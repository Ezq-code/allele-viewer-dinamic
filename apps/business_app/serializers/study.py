from rest_framework import serializers
from apps.business_app.serializers.pdb_files import PdbFilesSerializer
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer

from apps.business_app.models.study import Study


class StudySerializer(serializers.ModelSerializer):
    """Serializer for Study model including the display label for study_type."""

    study_type_display = serializers.CharField(
        source="get_study_type_display",
        read_only=True,
    )
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    study_allele_nodes = AlleleNodeSerializer(many=True, read_only=True)

    class Meta:
        model = Study
        fields = [
            "id",
            "study_type",
            "study_type_display",
            "uploaded_file",
            "successfull_load",
            "created_at",
            "extra_info",
            "pdb_files",
            "study_allele_nodes",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "study_type_display",
        ]
