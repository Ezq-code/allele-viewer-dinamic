from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.event_type import EventType


class Event(models.Model):
    name = models.CharField(_("Event Name"), max_length=255)
    icon = models.ImageField(
        verbose_name=_("Event Icon"), upload_to="images/", null=True, blank=True
    )
    pause_time = models.IntegerField(
        verbose_name=_("Pause Time in Milliseconds"), default=6000
    )
    event_type = models.ForeignKey(
        EventType,
        on_delete=models.CASCADE,
        verbose_name=_("Event Type"),
        null=True,
        blank=True,
    )
    description = models.TextField(_("Event Description"), null=True, blank=True)
    start_date = models.IntegerField(verbose_name=_("Start Date"))
    end_date = models.IntegerField(verbose_name=_("End Date"))
    reference = models.TextField(verbose_name=_("Reference"), null=True, blank=True)

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")

    def __str__(self):
        return f"{self.id}-{self.event_name}"
