from rest_framework import serializers


class UploadExcelSerializer(serializers.Serializer):
    archivo = serializers.FileField()
    nombre_archivo = serializers.CharField(max_length=255)
    
    def validate_archivo(self, value):
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError("Solo se permiten archivos Excel (.xlsx, .xls)")
        return value

