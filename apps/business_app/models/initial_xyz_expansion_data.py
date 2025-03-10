from django.db import models
from django.utils.translation import gettext_lazy as _


class InitialXyzExpansionData(models.Model):
    x_value = models.FloatField(verbose_name=_("X original value"))
    y_value = models.FloatField(verbose_name=_("Y original value"))
    z_value = models.FloatField(verbose_name=_("Z original value"))

    uploaded_file = models.ForeignKey(
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="initial_xyz_expansion_info",
    )

    class Meta:
        verbose_name = _("Initial XYZ expansion Data")
        verbose_name_plural = _("Initial XYZ expansion Data")

    def __str__(self):
        return f"{self.uploaded_file}({self.x_value}; {self.y_value}; {self.z_value})"
