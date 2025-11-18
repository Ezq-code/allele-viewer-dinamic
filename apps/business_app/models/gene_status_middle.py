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
        default=1
    )  # For boolean status type, remember 0 is False
    evidence = models.FileField(
        null=True, blank=True, upload_to="gene_status_evidence/"
    )
    created_timestamp = models.DateTimeField(
        verbose_name=_("Created timestamp"), auto_now_add=True
    )
    updated_timestamp = models.DateTimeField(
        verbose_name=_("Updated timestamp"), auto_now=True, null=True
    )

    class Meta:
        verbose_name = _("Gene status Middle")
        verbose_name_plural = _("Gene status Middle")

    def save(self, *args, **kwargs):
        saved_row = super().save(*args, **kwargs)
        related_gene_status_middle = GeneStatusMiddle.objects.filter(
            gene=self.gene
        ).only("value")
        count = related_gene_status_middle.count()
        total = 0
        for related_row in related_gene_status_middle.all():
            current_val = related_row.value
            if (
                current_val
                and related_row.gene_status.type
                is GeneStatus.TypeRepresentation.BOOLEAN
            ):
                current_val = 100
            total += current_val
        self.gene.status = total / count
        self.gene.save(update_fields=["status"])
        return saved_row

    def __str__(self):
        return f"{self.gene} ({self.gene_status})"
