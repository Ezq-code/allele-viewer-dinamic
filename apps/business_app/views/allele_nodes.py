from apps.business_app.models import AlleleNode
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.views.base_allele_nodes import BaseAlleleNodeViewSet


class AlleleNodeViewSet(BaseAlleleNodeViewSet):
    """ViewSet for retrieving and filtering allele nodes with inherited caching support."""

    queryset = AlleleNode.objects.all()
    serializer_class = AlleleNodeSerializer
