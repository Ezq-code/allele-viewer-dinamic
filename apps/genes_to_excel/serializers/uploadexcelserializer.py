from rest_framework import serializers


class UploadExcelSerializer(serializers.Serializer):
    archivo = serializers.FileField(
        required=True, help_text="Excel file (.xlsx, .xls) with genetic data"
    )
    nombre_archivo = serializers.CharField(
        required=True, max_length=255, help_text="Descriptive name for the file"
    )

    def validate_archivo(self, value):
        if not value.name.endswith((".xlsx", ".xls", ".xlsm")):
            raise serializers.ValidationError(
                "Only Excel files are allowed (.xlsx, .xls, .xlsm)"
            )
        return value
