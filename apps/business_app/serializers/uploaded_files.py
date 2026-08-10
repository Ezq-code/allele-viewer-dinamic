from rest_framework import serializers

from apps.business_app.models import UploadedFiles
from apps.business_app.models import StudyType
import logging

from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.pdb_files import PdbFilesSerializer
from apps.business_app.serializers.study import StudySerializerShort
import pandas as pd


logger = logging.getLogger(__name__)


class UploadedFileToCompareVsStudiesSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)

    def validate_file(self, value):
        
        study_types_sheet = StudyType.objects.only("sheet_name").values_list(
            "sheet_name", flat=True
        )
        try:
            excel_file = pd.ExcelFile(value)
            file_sheets = set(excel_file.sheet_names)
            study_types_set = set(study_types_sheet)

            unmatched_sheets_on_excel = file_sheets - study_types_set - UploadedFiles.SHEETS_TO_OMMIT_IN_PROCESSING
            unmatched_sheets_on_studies = study_types_set - file_sheets

            if unmatched_sheets_on_excel or unmatched_sheets_on_studies:
                raise serializers.ValidationError(
                    {
                        "unmatched_sheets_on_excel": list(unmatched_sheets_on_excel),
                        "unmatched_sheets_on_studies": list(unmatched_sheets_on_studies),
                    }
                )

            return value
        except Exception as e: 
            if isinstance(e, serializers.ValidationError):
                raise
            raise serializers.ValidationError(f"Error al validar el archivo: {str(e)}")


class SimpleListUploadedFilesSerializer(serializers.ModelSerializer):
    gene_name = serializers.CharField(source="gene.name", read_only=True, default=None)
    studies = StudySerializerShort(many=True, read_only=True)

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
            "predefined",
            "studies",
        ]
        read_only_fields = [
            "id",
        ]

    def save(self):
        try:
            return super().save()
        except Exception as e:
            logger.exception(f"{str(e)}")
            raise serializers.ValidationError(e) from e

class SheetStudyAssignmentSerializer(serializers.Serializer):
    sheet_name = serializers.CharField()
    study_type = serializers.PrimaryKeyRelatedField(queryset=StudyType.objects.all(), allow_null=True, required=False)

class UploadedFilesSerializer(SimpleListUploadedFilesSerializer):
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    allele_nodes = AlleleNodeSerializer(many=True, read_only=True)
    sheet_study_assignments = SheetStudyAssignmentSerializer(many=True, required=False)


    class Meta(SimpleListUploadedFilesSerializer.Meta):
        fields = SimpleListUploadedFilesSerializer.Meta.fields + [
            "pdb_files",
            "allele_nodes",
            "sheet_study_assignments",
        ]
        read_only_fields = SimpleListUploadedFilesSerializer.Meta.read_only_fields + [
            "gene_name",
            "predefined",
            "pdb_files",
            "allele_nodes",
        ]

