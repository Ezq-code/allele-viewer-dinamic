from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework import mixins


from apps.business_app.models.working_copy_of_original_file import (
    WorkingCopyOfOriginalFile,
)
from apps.business_app.serializers.working_copy_of_original_file import (
    WorkingCopyOfOriginalFileSerializer,
)
from apps.common.views import CommonOrderingFilter


# Create your views here.


class WorkingCopyOfOriginalFileViewSet(
    viewsets.ReadOnlyModelViewSet, mixins.DestroyModelMixin, GenericAPIView
):
    """ """

    queryset = WorkingCopyOfOriginalFile.objects.select_related(
        "system_user", "uploaded_file"
    )

    def get_queryset(self):
        return super().get_queryset().filter(system_user_id=self.request.user.id)

    serializer_class = WorkingCopyOfOriginalFileSerializer
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]
    filterset_fields = ["uploaded_file", "system_user"]

    permission_classes = [permissions.AllowAny]
