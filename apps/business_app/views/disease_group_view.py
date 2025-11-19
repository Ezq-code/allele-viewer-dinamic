from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.disease_group import DiseaseGroup
from rest_framework.viewsets import GenericViewSet
from apps.business_app.serializers.disease_group_serializer import (
    DiseaseGroupSerializer,
)
from apps.business_app.serializers.minimal_serializers import DiseaseGroupMinimalSerializer

from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class DiseaseGroupViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = DiseaseGroup.objects.all().prefetch_related(
        "subgroups",
        "subgroups__disorders",
    )

    def get_serializer_class(self):
        if self.action == 'minimal_list':
            return DiseaseGroupMinimalSerializer
        return DiseaseGroupSerializer

    search_fields = [
        "name",
        "description",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Endpoint reducido
    @action(
        detail=False,
        methods=["GET"],
        url_path="minimal-list",
        url_name="minimal-list",
    )
    def minimal_list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

