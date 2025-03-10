from rest_framework import serializers


from apps.business_app.models.custom_generated_pdb_files import CustomGeneratedPdbFiles


class CustomGeneratedPdbFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomGeneratedPdbFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "file",
        ]
        read_only_fields = ["id", "file"]
