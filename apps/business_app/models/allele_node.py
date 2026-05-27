from django.utils.translation import gettext_lazy as _
from django.db import models

from apps.business_app.models.base_allele_node import BaseAlleleNode


class AlleleNode(BaseAlleleNode):
    """Concrete allele graph node backed by the existing AlleleNode table."""

    study = models.ForeignKey(
        "Study",
        on_delete=models.CASCADE,
        verbose_name=_("Study ID"),
        null=True,
        blank=True,
        related_name="study_allele_nodes",
    )

    class Meta:
        verbose_name = _("Allele Node")
        verbose_name_plural = _("Allele Nodes")
