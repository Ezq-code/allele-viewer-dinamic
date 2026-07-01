from rest_framework import serializers

from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles


class GenesToExcelFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenesToExcelFiles
        fields = "__all__"
