import logging

from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class Study(models.Model):
    study_type = models.ForeignKey(
        to="StudyType",
        on_delete=models.PROTECT,
        related_name="studies",
        verbose_name=_("Study Type"),
        null=True,
        blank=True,
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
        return f"{self.uploaded_file.custom_name} - {self.study_type}"
