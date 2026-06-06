from rest_framework import serializers
from apps.business_app.serializers.pdb_files import PdbFilesSerializer
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.protein_nodes import ProteinNodeSerializer

from apps.business_app.models.study import Study


class StudySerializerShort(serializers.ModelSerializer):
    """Serializer for Study model. Exposes study_type_display as the name of the related StudyType."""

    study_type_display = serializers.CharField(
        source="study_type.name",
        read_only=True,
    )

    class Meta:
        model = Study
        fields = [
            "id",
            "study_type_display",
            "successfull_load",
            "created_at",
            "extra_info",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "study_type_display",
        ]


class StudySerializer(serializers.ModelSerializer):
    """Serializer for Study model. Exposes study_type_display as the name of the related StudyType."""

    study_type_display = serializers.CharField(
        source="study_type.name",
        read_only=True,
    )
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    allele_nodes = serializers.SerializerMethodField()

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

    def get_allele_nodes(self, obj):
        if obj.study_allele_nodes.count():
            return AlleleNodeSerializer(obj.study_allele_nodes.all(), many=True).data
        elif obj.study_protein_nodes.count():
            return ProteinNodeSerializer(obj.study_protein_nodes.all(), many=True).data
        else:
            return []
