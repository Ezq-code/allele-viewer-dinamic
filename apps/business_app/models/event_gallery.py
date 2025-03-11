from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.event import Event


class EventGallery(models.Model):
    name = models.CharField(
        verbose_name=_("Image name"), max_length=255, null=True, blank=True
    )
    event = models.ForeignKey(
        to=Event,
        verbose_name=_("Event"),
        on_delete=models.CASCADE,
        related_name="event_gallery",
    )
    image = models.ImageField(verbose_name=_("Image"), upload_to="gallery/")

    class Meta:
        verbose_name = _("Event Gallery")
        verbose_name_plural = _("Event Gallery")

    def __str__(self):
        return f"{self.id}-{self.name}"
