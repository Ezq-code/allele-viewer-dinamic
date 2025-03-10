from django.db import models
from django.utils.translation import gettext_lazy as _


class InitialFileData(models.Model):
    allele = models.CharField(verbose_name=_("Allele"), max_length=150)
    marker = models.CharField(verbose_name=_("Marker"), max_length=150)
    original_value = models.PositiveSmallIntegerField(verbose_name=_("Original Value"))
    min_value = models.PositiveSmallIntegerField(verbose_name=_("Min Value"))
    max_value = models.PositiveSmallIntegerField(verbose_name=_("Max Value"))
    row_index = models.PositiveSmallIntegerField(verbose_name=_("Row Index"))

    uploaded_file = models.ForeignKey(
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="initial_info",
    )

    class Meta:
        verbose_name = _("Initial File Data")
        verbose_name_plural = _("Initial File Data")

    def __str__(self):
        return f"{self.allele}-{self.marker}"
