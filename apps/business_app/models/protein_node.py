from django.utils.translation import gettext_lazy as _
from django.db import models

from apps.business_app.models.base_allele_node import BaseAlleleNode


class ProteinNode(BaseAlleleNode):
    """Protein node that reuses allele-node structure and adds protein metadata."""

    allele_name = models.CharField(verbose_name=_("Allele"), max_length=30)
    is_final_for_allele = models.BooleanField(
        verbose_name=_("Is Final For Allele"), default=False
    )

    class Meta:
        verbose_name = _("Allele Node")
        verbose_name_plural = _("Allele Nodes")
