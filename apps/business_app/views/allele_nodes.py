from functools import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions
from apps.business_app.models import AlleleNode
from rest_framework import mixins
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework_extensions.mixins import NestedViewSetMixin
from apps.common.pagination import AllResultsSetPagination
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


from rest_framework.response import Response

from apps.common.views import CommonOrderingFilter


# Create your views here.
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
    }
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "unique_number"

    @method_decorator(cache_page(timeout=None))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
