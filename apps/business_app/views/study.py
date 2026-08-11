from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.business_app.models.study import Study
from apps.business_app.serializers.study import StudySerializer
from apps.common.pagination import AllResultsSetPagination
from apps.common.views import CommonOrderingFilter


# @extend_schema(
#     parameters=[
#         OpenApiParameter(
#             name="parent_lookup_uploaded_file",
#             type=OpenApiTypes.INT,
#             location=OpenApiParameter.PATH,
#             description="ID of the uploaded file",
#         )
#     ]
# )
# class StudyViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
class StudyViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Study resources."""

    queryset = (
        Study.objects.select_related("uploaded_file")
        .prefetch_related("pdb_files", "study_allele_nodes")
        .all()
    )
    serializer_class = StudySerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "uploaded_file__custom_name",
        "extra_info",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = {
        "study_type": ["exact"],
        "successfull_load": ["exact"],
        "uploaded_file": ["exact"],
        "uploaded_file__gene": ["exact"],
        "created_at": ["exact", "gte", "lte"],
    }
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter by uploaded_file when accessed through nested route."""
        queryset = (
            Study.objects.filter(successfull_load=True)
            .select_related("uploaded_file")
            .prefetch_related("pdb_files", "study_allele_nodes", "study_protein_nodes")
            .all()
        )
        parent_lookup_uploaded_file = self.kwargs.get("parent_lookup_uploaded_file")
        if parent_lookup_uploaded_file is not None:
            queryset = queryset.filter(uploaded_file_id=parent_lookup_uploaded_file)
        return queryset
