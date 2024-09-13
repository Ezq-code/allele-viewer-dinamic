from rest_framework import serializers


from apps.business_app.models.pdb_files import PdbFiles


class PdbFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PdbFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "pdb_content",
        ]
        read_only_fields = ["id", "pdb_content"]
