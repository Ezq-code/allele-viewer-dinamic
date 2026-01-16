from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions
from apps.business_app.models import AlleleNode
from rest_framework import mixins
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework_extensions.mixins import NestedViewSetMixin
from apps.common.pagination import AllResultsSetPagination
from django.core.cache import cache
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


from rest_framework.response import Response

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
class AlleleNodeViewSet(
    NestedViewSetMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = AlleleNode.objects.all()

    serializer_class = AlleleNodeSerializer
    search_fields = [
        "number",
        "element",
        "custom_element_name",
        "loss",
        "increment",
        "region",
        "rs",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = {
        "element": ["exact"],
        "custom_element_name": ["exact"],
        "rs": ["exact"],
        "number": ["exact"],
        "timeline_appearence": ["exact", "gte", "lte"],
        "age_1": ["exact", "gte", "lte"],
        "age_2": ["exact", "gte", "lte"],
        # "frec_eas": ["exact", "gte", "lte"], # TODO poner las frecuencias de los fields
        # "frec_ame": ["exact", "gte", "lte"],
        # "frec_eur": ["exact", "gte", "lte"],
        # "frec_sas": ["exact", "gte", "lte"],
        # "frec_afr": ["exact", "gte", "lte"],
    }
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "unique_number"

    def list(self, request, *args, **kwargs):
        parent_lookup_key = kwargs.get("parent_lookup_uploaded_file")
        search_criteria = request.query_params.get("search", "")
        cache_key = AlleleNode.CACHE_KEY_LIST_OR_SEARCH.format(
            parent_lookup_key=parent_lookup_key, search_criteria=search_criteria
        )
        response_content = cache.get(cache_key, None)
        if not response_content:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            response_content = serializer.data
            cache.set(cache_key, response_content)
        return Response({"results": response_content})
