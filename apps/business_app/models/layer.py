from django.db import models
from django.utils.translation import gettext_lazy as _


class Layer(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Name of the Layers"))
    is_visible = models.BooleanField(default=True, verbose_name=_("Is Visible"))

    class Meta:
        verbose_name = _("Layer")
        verbose_name_plural = _("Layers")

    def __str__(self):
        return f"{self.name}"
