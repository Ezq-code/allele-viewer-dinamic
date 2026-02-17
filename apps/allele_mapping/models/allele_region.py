from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.business_app.models.sub_country import SubCountry


class AlleleRegion(models.Model):
    population = models.CharField(
        verbose_name=_("population"),
        max_length=100,
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
    sub_region = models.ForeignKey(
        to=SubCountry,
        on_delete=models.SET_NULL,
        related_name="allele_regions",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Allele Region")
        verbose_name_plural = _("Allele Regions")

    def __str__(self):
        return f"{self.population}"
