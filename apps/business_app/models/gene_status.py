from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.gene import Gene


class GeneStatus(models.Model):
    class TypeRepresentation(models.TextChoices):
        PERCENT = "P", _("Percent")
        BOOLEAN = "B", _("Boolean")

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(
        max_length=1,
        choices=TypeRepresentation.choices,
        default=TypeRepresentation.PERCENT,
    )
    requires_evidence = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Call the "real" save() method.
        if is_new:
            from apps.business_app.models.gene_status_middle import GeneStatusMiddle

            gene_status_middle_list = []
            for gene in Gene.objects.all():
                gene_status_middle_list.append(
                    GeneStatusMiddle(
                        gene=gene,
                        gene_status=self,
                    )
                )
            GeneStatusMiddle.objects.bulk_create(gene_status_middle_list)

    class Meta:
        verbose_name = _("Gene status")
        verbose_name_plural = _("Gene status")

    def __str__(self):
        return f"{self.name}"
