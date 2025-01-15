from django.db import models
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    event_name = models.CharField(_("Event Name"), max_length=255)
    event_icon = models.ImageField(verbose_name=_("Event Icon"), upload_to="images/")
    pause_time = models.IntegerField(verbose_name=_("Pause Time in Milliseconds"), default=6000)


    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")

    def __str__(self):
        return f"{self.id}-{self.event_name}"
