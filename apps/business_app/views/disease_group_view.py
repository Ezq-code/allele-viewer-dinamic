from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.disease_group import DiseaseGroup
from rest_framework.viewsets import GenericViewSet
from apps.business_app.serializers.disease_group_serializer import (
    DiseaseGroupSerializer,
)
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class DiseaseGroupViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = DiseaseGroup.objects.all()

    serializer_class = DiseaseGroupSerializer
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
