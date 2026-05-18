from django.utils.translation import gettext_lazy as _

from apps.business_app.models.base_allele_node import BaseAlleleNode
from django.db import models


class AlleleNode(BaseAlleleNode):
    """Concrete allele graph node backed by the existing AlleleNode table."""

    class Meta:
        verbose_name = _("Allele Node")
        verbose_name_plural = _("Allele Nodes")
