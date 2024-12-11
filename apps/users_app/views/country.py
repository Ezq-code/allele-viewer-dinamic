from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, permissions
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response


from apps.common.views import GetAllMixin
from apps.users_app.models import Country
from apps.users_app.serializers import CountrySerializer
from rest_framework.decorators import action


# Create your views here.


class CountryViewSet(
    mixins.RetrieveModelMixin,
    GetAllMixin,
    GenericViewSet,
):
    """
    API endpoint that allows Countries added or edited.
    """

    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    search_fields = [
        "name",
        "region_country__region__name"
    ]
    filterset_fields = [
        "enabled",
    ]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    ordering_fields = "__all__"

    permission_classes = [permissions.AllowAny]

    @action(
        methods=["get"],
        detail=False,
        url_name="get-codes",
        url_path="get-codes",
    )
    def get_codes(self, request):
        codes = self.filter_queryset(self.get_queryset()).values_list("code", flat=True)
        return Response(codes)