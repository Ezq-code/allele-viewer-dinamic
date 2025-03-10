from django.db import models
from django.utils.translation import gettext_lazy as _


class Marker(models.Model):
    class TYPE_FORMATS(models.TextChoices):
        AFTERCHRIST = "After Christ (AC)"
        BEFORECHRIST = "Before Christ (BC)"
        BEFOREPRESENT = "Before Present (YBP)"

    latitude = models.CharField(max_length=255, verbose_name=_("Latitude"))
    longitude = models.CharField(max_length=255, verbose_name=_("Longitude"))
    start_date = models.IntegerField(verbose_name=_("Start Date"))
    end_date = models.IntegerField(verbose_name=_("End Date"))
    start_format = models.CharField(
        verbose_name="Start Date Format",
        max_length=255,
        null=True,
        blank=True,
        choices=TYPE_FORMATS.choices,
    )
    end_format = models.CharField(
        verbose_name="End Date Format",
        max_length=255,
        null=True,
        blank=True,
        choices=TYPE_FORMATS.choices,
    )
    description = models.TextField(verbose_name=_("Description"), unique=True)
    reference = models.TextField(verbose_name=_("Reference"), null=True, blank=True)
    event_type = models.ForeignKey(
        to="Event", verbose_name=_("Event Type"), on_delete=models.CASCADE
    )
    pause_time = models.IntegerField(
        verbose_name=_("Pause Time in Milliseconds"), default=0
    )

    class Meta:
        verbose_name = _("Marker")
        verbose_name_plural = _("Markers")

    def __str__(self):
        return f"{self.id}-{self.event_type.event_name}"
