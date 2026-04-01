from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.users_app.models.country import Country


class SubCountry(models.Model):
    name = models.CharField(_("Name"), max_length=255)
    country = models.ForeignKey(
        to=Country, on_delete=models.CASCADE, related_name="subcountries"
    )

    class Meta:
        verbose_name = _("SubCountry")
        verbose_name_plural = _("SubCountries")
        constraints = [
            models.UniqueConstraint(
                fields=["name", "country"],
                name="unique_region_in_country",
            )
        ]

    def __str__(self):
        return f"{self.name}"
