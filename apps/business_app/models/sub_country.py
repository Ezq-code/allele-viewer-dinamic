from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country
from colorfield.fields import ColorField


class SubCountry(models.Model):
    name = models.CharField(_("Name"), max_length=255)
    country = models.ForeignKey(
        to=Country, on_delete=models.CASCADE, related_name="subcountries"
    )

    class Meta:
        verbose_name = _("SubCountry")
        verbose_name_plural = _("SubCountries")

    def __str__(self):
        return f"{self.name}"
