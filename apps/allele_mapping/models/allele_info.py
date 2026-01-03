from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.allele_mapping.models.allele_to_map import AlleleToMap


class AlleleInfo(models.Model):
    allele = models.ForeignKey(
        AlleleToMap, on_delete=models.CASCADE, related_name="allele_info"
    )
    population = models.CharField(
        verbose_name=_("population"),
        max_length=100,
    )
    percent_of_individuals = models.FloatField(
        verbose_name=_("percent of individuals"),
        null=True,
        blank=True,
    )
    allele_frequency = models.FloatField(
        verbose_name=_("allele frequency"),
        null=True,
        blank=True,
    )
    sample_size = models.IntegerField(
        verbose_name=_("sample size"),
        null=True,
        blank=True,
    )
    location = models.CharField(
        verbose_name=_("location"),
        max_length=100,
        null=True,
        blank=True,
    )
    lat = models.FloatField(
        verbose_name=_("latitude"),
        null=True,
        blank=True,
    )
    lon = models.FloatField(
        verbose_name=_("longitude"),
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Allele info")
        verbose_name_plural = _("Alleles info")

    def __str__(self):
        return f"{self.allele.name} ({self.allele.gene.name})"
