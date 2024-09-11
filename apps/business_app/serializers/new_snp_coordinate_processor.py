from rest_framework import serializers

from apps.business_app.models import InitialFileData
from apps.business_app.models.uploaded_files import UploadedFiles


class NewValuesInputSerializer(serializers.Serializer):
    initial_filedata_id = serializers.PrimaryKeyRelatedField(
        queryset=InitialFileData.objects.all(), required=True
    )
    new_percent_value = serializers.FloatField(
        required=True, min_value=0, max_value=100
    )


class SnpCoordinateProcessorInputSerializer(serializers.Serializer):
    file_id = serializers.PrimaryKeyRelatedField(
        queryset=UploadedFiles.objects.all(), required=True
    )
    values = NewValuesInputSerializer(many=True)
