from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.business_app.models.disorder import Disorder
from apps.business_app.serializers.disorder_serializer import DisorderSerializer
from apps.common.pagination import AllResultsSetPagination
from apps.business_app.serializers.minimal_serializers import DisorderMinimalSerializer


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

    def get_serializer_class(self):
        if self.action == 'minimal_list':
            return DisorderMinimalSerializer
        return DisorderSerializer

    search_fields = [
        "name",
        "description",
        "genes__name",
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