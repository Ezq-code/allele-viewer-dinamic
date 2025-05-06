from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country
from colorfield.fields import ColorField



class Region(models.Model):
    name = models.CharField(_("Name"), max_length=255)
    countries = models.ManyToManyField(to=Country, through=RegionCountry)
    color = ColorField(_("Color"), default="#808080") #gris
    symbol = models.CharField(max_length=50, null=True, blank=True, default=None)

    class Meta:
        verbose_name = _("Region")
        verbose_name_plural = _("Regions")

    def __str__(self):
        return f"{self.name}"
