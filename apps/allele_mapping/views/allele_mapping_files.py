from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView


from apps.common.views import CommonOrderingFilter
from apps.allele_mapping.models.allele_mapping_files import AlleleMappingFiles
from apps.allele_mapping.serializers.allele_mapping_files import (
    AlleleMappingFilesSerializer,
)


# Create your views here.


class AlleleMappingFilesViewSet(viewsets.ModelViewSet, GenericAPIView):
    """
    API endpoint that allows file upload extensions added or edited.
    """

    queryset = AlleleMappingFiles.objects.all()
    serializer_class = AlleleMappingFilesSerializer

    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    search_fields = [
        "description",
        "file",
        "system_user__username",
    ]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
