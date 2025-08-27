from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from apps.business_app.models.gene import Gene
from rest_framework.viewsets import GenericViewSet
from apps.business_app.serializers.gene_serializer import GeneSerializer
from apps.common.pagination import AllResultsSetPagination


from apps.common.views import CommonOrderingFilter


# Create your views here.
class GeneViewSet(
    viewsets.ModelViewSet,
    GenericViewSet,
):
    pagination_class = AllResultsSetPagination
    queryset = Gene.objects.all()

    serializer_class = GeneSerializer
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
    filterset_fields = ("status",)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
