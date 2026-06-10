from rest_framework import serializers

from apps.business_app.models.study_type import StudyType


class StudyTypeSerializer(serializers.ModelSerializer):
    """Serializer for StudyType model."""

    class Meta:
        model = StudyType
        fields = [
            "id",
            "name",
            "sheet_name",
            "classification",
        ]
