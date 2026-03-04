from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.business_app.models.sub_country import SubCountry


class AlleleRegionCoord(models.Model):
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
    allele_region = models.ForeignKey(
        to="allele_mapping.AlleleRegion",
        on_delete=models.CASCADE,
        related_name="coordinates",
    )

    class Meta:
        verbose_name = _("Allele Region Coordinate")
        verbose_name_plural = _("Allele Region Coordinates")

    def __str__(self):
        return f"{self.allele_region}"
