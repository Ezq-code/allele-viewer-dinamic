from rest_framework import serializers

from apps.business_app.models.uploaded_files import UploadedFiles


class XyzCoordinateProcessorInputSerializer(serializers.Serializer):
    file_id = serializers.PrimaryKeyRelatedField(
        queryset=UploadedFiles.objects.all(), required=True
    )
    x_value = serializers.FloatField(required=False)
    y_value = serializers.FloatField(required=False)
    z_value = serializers.FloatField(required=False)
