from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from apps.business_app.models.feature import POINT
from apps.business_app.serializers.feature import FeatureSerializer
from apps.common.views import CommonOrderingFilter
from apps.business_app.models import Feature
from apps.business_app.serializers import AllowedExtensionsSerializer
from apps.common.pagination import AllResultsSetPagination
from django.db.models import Q

# Create your views here.


class FeatureViewSet(viewsets.ModelViewSet, GenericAPIView):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    pagination_class = AllResultsSetPagination
    search_fields = [
        "__all__",
    ]
    ordering_fields = "__all__"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        CommonOrderingFilter,
    ]

    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        filter_by_point = Q(geometry_type=POINT) if self.action is "list" else Q()
        return self.queryset.filter(filter_by_point)
