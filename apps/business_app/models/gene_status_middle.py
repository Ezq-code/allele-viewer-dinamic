from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status import GeneStatus


class GeneStatusMiddle(models.Model):
    gene = models.ForeignKey(
        to=Gene, on_delete=models.CASCADE, related_name="gene_status_list"
    )
    gene_status = models.ForeignKey(
        to=GeneStatus, on_delete=models.CASCADE, related_name="gene_list"
    )
    value = models.PositiveSmallIntegerField(
        default=0
    )  # For boolean status type, remember 0 is False
    evidence = models.FileField(
        null=True, blank=True, upload_to="gene_status_evidence/"
    )

    class Meta:
        verbose_name = _("Gene status Middle")
        verbose_name_plural = _("Gene status Middle")

    def __str__(self):
        return f"{self.gene} ({self.gene_status})"
