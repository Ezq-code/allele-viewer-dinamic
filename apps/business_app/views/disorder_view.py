from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.viewsets import GenericViewSet
from apps.business_app.models.disorder import Disorder
from apps.business_app.serializers.disorder_serializer import DisorderSerializer
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class DisorderViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = (
        Disorder.objects.select_related("disease_subgroup")
        .prefetch_related("genes")
        .all()
    )

    serializer_class = DisorderSerializer
    search_fields = [
        "name",
        "description",
        "genes_name",
    ]
    filterset_fields = [
        "disease_subgroup",
        "disease_subgroup__disease_group",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
