from rest_framework import serializers
from apps.business_app.serializers.pdb_files import PdbFilesSerializer
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer

from apps.business_app.models.study import Study


class StudySerializer(serializers.ModelSerializer):
    """Serializer for Study model. Exposes study_type_display as the name of the related StudyType."""

    study_type_display = serializers.CharField(
        source="study_type.name",
        read_only=True,
    )
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    allele_nodes = AlleleNodeSerializer(
        source="study_allele_nodes", many=True, read_only=True
    )

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
            "allele_nodes",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "study_type_display",
        ]
