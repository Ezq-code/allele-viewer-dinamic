from django.utils.translation import gettext_lazy as _
from django.db import models

from apps.business_app.models.base_allele_node import BaseAlleleNode


class ProteinNode(BaseAlleleNode):
    """Protein node that reuses allele-node structure and adds protein metadata."""

    is_final_for_allele = models.BooleanField(
        verbose_name=_("Is Final For Allele"), default=False
    )

    uploaded_file = models.ForeignKey(
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="protein_nodes",
    )

    class Meta:
        verbose_name = _("Protein Node")
        verbose_name_plural = _("Protein Nodes")
