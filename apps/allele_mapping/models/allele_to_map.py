from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.business_app.models.gene import Gene
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_region import AlleleRegion


class AlleleToMap(models.Model):
    name = models.CharField(
        verbose_name=_("name"),
        max_length=50,
        db_index=True,
    )
    file = models.ForeignKey(
        to="allele_mapping.AlleleMappingFiles",
        on_delete=models.CASCADE,
        related_name="alleles",
    )
    gene = models.ForeignKey(
        Gene,
        on_delete=models.CASCADE,
        related_name="allele_mapping_files",
    )
    regions = models.ManyToManyField(to=AlleleRegion, through=AlleleRegionInfo)

    class Meta:
        verbose_name = _("Allele to map")
        verbose_name_plural = _("Alleles to map")

    def __str__(self):
        return f"{self.name} ({self.gene.name})"
