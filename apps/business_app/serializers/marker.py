from rest_framework import serializers
from apps.business_app.models.marker import Marker


class MarkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marker
        fields = '__all__'
