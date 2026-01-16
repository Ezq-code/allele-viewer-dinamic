from rest_framework import filters, permissions
from rest_framework import mixins
from apps.business_app.models.initial_file_data import InitialFileData
from rest_framework.viewsets import GenericViewSet
from rest_framework_extensions.mixins import NestedViewSetMixin
from apps.business_app.serializers.initial_file_data import InitialFileDataSerializer
from apps.common.pagination import AllResultsSetPagination
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


from apps.common.views import CommonOrderingFilter


# Create your views here.
@extend_schema(
    parameters=[
        OpenApiParameter(
            name="parent_lookup_uploaded_file",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the uploaded file"
        )
    ]
)
class InitialFileDataViewSet(
    NestedViewSetMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = InitialFileData.objects.all()

    serializer_class = InitialFileDataSerializer
    search_fields = [
        "allele",
        "marker",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
