from django.db import models
from django.utils.translation import gettext_lazy as _


class Gene(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True,)
    description = models.TextField(null=True, blank=True)
    status = models.SmallIntegerField(default=0)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Call the "real" save() method.
        if is_new:
            from apps.business_app.models.gene_status_middle import GeneStatusMiddle
            from apps.business_app.models.gene_status import GeneStatus

            gene_status_middle_list = []
            for gene_status in GeneStatus.objects.all():
                gene_status_middle_list.append(
                    GeneStatusMiddle(
                        gene=self,
                        gene_status=gene_status,
                    )
                )
            GeneStatusMiddle.objects.bulk_create(gene_status_middle_list)

    class Meta:
        verbose_name = _("Gene")
        verbose_name_plural = _("Genes")

    def __str__(self):
        return f"{self.name}"
