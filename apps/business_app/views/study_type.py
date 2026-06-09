from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView

from apps.business_app.models.study_type import StudyType
from apps.business_app.serializers.study_type import StudyTypeSerializer
from apps.common.pagination import AllResultsSetPagination
from apps.common.views import CommonOrderingFilter


class StudyTypeViewSet(viewsets.ModelViewSet, GenericAPIView):
    """CRUD ViewSet for StudyType resources."""

    queryset = StudyType.objects.all()
    serializer_class = StudyTypeSerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "name",
        "sheet_name",
        "classification",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = {
        "classification": ["exact"],
    }
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
