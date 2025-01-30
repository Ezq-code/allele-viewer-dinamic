from rest_framework import serializers


from apps.business_app.models.marker_gallery import MarkerGallery


class MarkerGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = MarkerGallery
        fields = ['id', 'name', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

