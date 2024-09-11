from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.business_app.models import SiteConfiguration
from apps.business_app.serializers import SiteConfigurationSerializer

# Create your views here.


class SiteConfigurationViewSet(
    GenericViewSet,
):
    """
    API endpoint that allows configurations to be viewed or edited.
    """

    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return SiteConfiguration.get_solo()

    @action(
        methods=["get"],
        detail=False,
        url_name="get-configurations",
        url_path="get-configurations",
    )
    def get_configurations(
        self,
        request,
    ):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(
        methods=["patch"],
        detail=False,
        url_name="update-configurations",
        url_path="update-configurations",
    )
    def update_configurations(
        self,
        request,
    ):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
