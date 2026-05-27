import logging

from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class Study(models.Model):
    class STUDY_TYPE(models.TextChoices):
        GEN_ALLELE = "G", _("Genetic Allele")
        LOCATION = "L", _("Location")
        ANCESTERS = "A", _("Ancestors")

    study_type = models.CharField(
        verbose_name=_("Study Type"),
        max_length=1,
        choices=STUDY_TYPE.choices,
        default=STUDY_TYPE.GEN_ALLELE,
    )
    uploaded_file = models.ForeignKey(
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="studies",
    )
    successfull_load = models.BooleanField(
        verbose_name=_("Successful Load"), default=False
    )

    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,
    )
    extra_info = models.TextField(null=True, blank=True, verbose_name=_("Extra Info"))

    class Meta:
        verbose_name = _("Study")
        verbose_name_plural = _("Studies")

    def __str__(self):
        return f"{self.uploaded_file.custom_name} - {self.get_study_type_display()}"
