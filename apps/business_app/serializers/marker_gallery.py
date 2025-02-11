from rest_framework import serializers


from apps.business_app.models.marker_gallery import MarkerGallery


class MarkerGallerySerializer(serializers.ModelSerializer):

    class Meta:
        model = MarkerGallery
        fields = ['id', 'name', 'marker', 'image']

