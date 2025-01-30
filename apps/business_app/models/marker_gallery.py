from django.db import models
from django.utils.translation import gettext_lazy as _


class MarkerGallery(models.Model):
    name = models.CharField(verbose_name=_("Image name"), max_length=255, null=True, blank=True)
    marker = models.ForeignKey(
        to="Marker", verbose_name=_("Marker"), on_delete=models.CASCADE
    )
    image = models.ImageField(verbose_name=_("Image"), upload_to="gallery/")

    class Meta:
        verbose_name = _("Marker Gallery")
        verbose_name_plural = _("Markers Gallery")

    def __str__(self):
        return f"{self.id}-{self.name}"
