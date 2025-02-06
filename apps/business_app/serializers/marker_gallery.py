from rest_framework import serializers


from apps.business_app.models.marker_gallery import MarkerGallery
from apps.business_app.models.marker import Marker


class MarkerGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    marker = serializers.PrimaryKeyRelatedField(queryset=Marker.objects.all())

    class Meta:
        model = MarkerGallery
        fields = ['id', 'name', 'marker', 'image_url', 'image']

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        else:
            return None

    def validate(self, data):
        if self.instance is None and 'image' not in data:
            raise serializers.ValidationError({"image": "This field is required when creating a new MarkerGallery."})
        return data

