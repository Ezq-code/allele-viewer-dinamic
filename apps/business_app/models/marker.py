from django.db import models
from django.utils.translation import gettext_lazy as _


class Marker(models.Model):
    latitude = models.CharField(max_length=255, verbose_name=_("Latitude"))
    longitude = models.CharField(max_length=255, verbose_name=_("Longitude"))

    event = models.ForeignKey(
        to="Event",
        verbose_name=_("Event"),
        on_delete=models.CASCADE,
        related_name="markers",
    )

    class Meta:
        verbose_name = _("Marker")
        verbose_name_plural = _("Markers")

    def __str__(self):
        return f"{self.id}-{self.event.event_name}"
