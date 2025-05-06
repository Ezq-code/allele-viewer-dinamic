from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.users_app.models.country import Country


class RegionCountry(models.Model):
    region = models.ForeignKey(
        to="Region", on_delete=models.CASCADE, related_name="countries_for_region"
    )
    country = models.ForeignKey(
        to=Country, on_delete=models.CASCADE, related_name="region_country"
    )

    class Meta:
        verbose_name = _("Country by region")
        verbose_name_plural = _("Countries by region")

    def __str__(self):
        return f"{self.region}-{self.country}"
