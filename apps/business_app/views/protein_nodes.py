from apps.business_app.models import ProteinNode
from apps.business_app.serializers.protein_nodes import ProteinNodeSerializer
from apps.business_app.views.base_allele_nodes import BaseAlleleNodeViewSet


class ProteinNodeViewSet(BaseAlleleNodeViewSet):
    """
    ViewSet for retrieving and filtering protein nodes with inherited caching support.

    Extends base functionality with protein-specific filtering on is_final_for_allele field.
    """

    queryset = ProteinNode.objects.all()
    serializer_class = ProteinNodeSerializer
    filterset_fields = {
        **BaseAlleleNodeViewSet.filterset_fields,
        "is_final_for_allele": ["exact"],
    }
