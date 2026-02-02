from django.db import models
from django.utils.translation import gettext_lazy as _


class AlleleRegionInfo(models.Model):
    allele = models.ForeignKey(
        "allele_mapping.AlleleToMap",
        on_delete=models.CASCADE,
        related_name="allele_regions",
    )
    region = models.ForeignKey(
        "allele_mapping.AlleleRegion", on_delete=models.CASCADE, related_name="alleles"
    )
    percent_of_individuals = models.FloatField(
        verbose_name=_("percent of individuals"),
        null=True,
        blank=True,
        db_index=True,
    )
    allele_frequency = models.FloatField(
        verbose_name=_("allele frequency"),
        null=True,
        blank=True,
        db_index=True,
    )
    sample_size = models.IntegerField(
        verbose_name=_("sample size"),
        null=True,
        blank=True,
        db_index=True,
    )

    class Meta:
        verbose_name = _("Allele region info")
        verbose_name_plural = _("Alleles region info")
        indexes = [
            models.Index(
                fields=["allele_frequency", "sample_size"], name="idx_freq_sample"
            ),
            models.Index(fields=["region", "allele_frequency"], name="idx_region_freq"),
            models.Index(
                fields=["allele", "allele_frequency", "sample_size"],
                name="idx_allele_freq_sample",
            ),
        ]

    def __str__(self):
        return f"{self.allele.name} ({self.region.population})"
