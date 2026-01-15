from rest_framework import serializers
from apps.allele_mapping.models.allele_mapping_files import AlleleMappingFiles


class AlleleMappingFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleMappingFiles
        fields = "__all__"
