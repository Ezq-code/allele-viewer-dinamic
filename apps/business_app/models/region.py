from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country


class Region(models.Model):
    name = models.CharField(_("Name"), max_length=255)
    countries = models.ManyToManyField(to=Country, through=RegionCountry)
    color = models.CharField(_("Color"), max_length=7, default="#ffffff")
    symbol = models.CharField(max_length=50, null=True, blank=True, default=None)

    class Meta:
        verbose_name = _("Region")
        verbose_name_plural = _("Regions")

    def __str__(self):
        return f"{self.name}"
