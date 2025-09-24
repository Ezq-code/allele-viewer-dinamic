from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.disease_subgroup import DiseaseSubGroup
from rest_framework.viewsets import GenericViewSet
from apps.business_app.serializers.disease_subgroup_serializer import (
    DiseaseSubGroupSerializer,
)
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class DiseaseSubGroupViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = DiseaseSubGroup.objects.all()

    serializer_class = DiseaseSubGroupSerializer
    search_fields = [
        "name",
        "description",
    ]
    filterset_fields = [
        "disease_group",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
