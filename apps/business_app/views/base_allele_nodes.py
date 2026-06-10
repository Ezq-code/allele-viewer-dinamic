from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, mixins
from rest_framework.viewsets import GenericViewSet
from rest_framework_extensions.mixins import NestedViewSetMixin
from apps.common.pagination import AllResultsSetPagination
from django.core.cache import cache
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework.response import Response

from apps.common.views import CommonOrderingFilter


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="parent_lookup_uploaded_file",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the uploaded file",
        )
    ]
)
class BaseAlleleNodeViewSet(
    NestedViewSetMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    """
    Abstract base ViewSet for AlleleNode-like models with caching support.

    Provides shared functionality for:
    - Nested routing under UploadedFiles
    - Search and filtering across common fields
    - List response caching with composite keys
    - Pagination and permissions
    """

    pagination_class = AllResultsSetPagination
    search_fields = [
        "number",
        "element",
        "allele",
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
        "allele": ["exact"],
        "rs": ["exact"],
        "number": ["exact"],
        "timeline_appearence": ["exact", "gte", "lte"],
        "age_1": ["exact", "gte", "lte"],
        "age_2": ["exact", "gte", "lte"],
    }
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "unique_number"

    def list(self, request, *args, **kwargs):
        """
        Retrieve cached or compute node list with applied filters.

        Uses a composite cache key based on parent_lookup and search criteria
        to avoid unnecessary database queries.
        """
        parent_lookup_key = kwargs.get("parent_lookup_uploaded_file")
        search_criteria = request.query_params.get("search", "")
        model_class = self.queryset.model
        cache_key = model_class.CACHE_KEY_LIST_OR_SEARCH.format(
            parent_lookup_key=parent_lookup_key, search_criteria=search_criteria
        )
        response_content = cache.get(cache_key, None)
        if not response_content:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            response_content = serializer.data
            cache.set(cache_key, response_content)
        return Response({"results": response_content})
