from rest_framework import serializers
from apps.business_app.models.feature import Feature


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'
