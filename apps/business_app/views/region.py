from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.business_app.models.region import Region
from apps.business_app.serializers.regions import RegionSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import UploadedFiles
from apps.business_app.serializers import UploadedFilesSerializer


# Create your views here.


class RegionViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    """

    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    search_fields = ["name"]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

