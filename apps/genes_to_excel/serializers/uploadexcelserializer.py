from rest_framework import serializers


class UploadExcelSerializer(serializers.Serializer):
    archivo = serializers.FileField(
        required=True,
        help_text="Archivo Excel (.xlsx, .xls) con los datos genéticos"
    )
    nombre_archivo = serializers.CharField(
        required=True,
        max_length=255,
        help_text="Nombre descriptivo para el archivo"
        )

    def validate_archivo(self, value):
        if not value.name.endswith((".xlsx", ".xls", '.xlsm')):
            raise serializers.ValidationError(
                "Solo se permiten archivos Excel (.xlsx, .xls, .xlsm)"
            )
        return value
