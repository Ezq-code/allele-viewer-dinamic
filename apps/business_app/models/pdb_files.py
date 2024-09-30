import os

from django.db import models
from django.utils.translation import gettext_lazy as _


def user_processed_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    to_return = f"user_{instance.original_file.system_user_id}/"
    to_return += f"processed_files/pdb_for_file_{instance.original_file.id}/{filename}"
    return to_return


class PdbFiles(models.Model):
    class KIND(models.TextChoices):
        GRAPH_GENERATED = "G", _("Graph generated")
        EXCEL_GENERATED = "D", _("Excel generated")

    custom_name = models.CharField(
        verbose_name=_("custom name"),
        max_length=150,
    )
    description = models.TextField(
        verbose_name=_("description"),
        max_length=150,
        blank=True,
        null=True,
    )
    original_file = models.ForeignKey(
        verbose_name=_("Original File"),
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="pdb_files",
    )
    pdb_content = models.TextField(
        verbose_name=_("Processed File Content"),
        null=True,
    )
    kind = models.CharField(
        verbose_name=_("Kind"),
        max_length=1,
        choices=KIND.choices,
        default=KIND.EXCEL_GENERATED,
    )

    class Meta:
        verbose_name = _("PDB File")
        verbose_name_plural = _("PDB Files")

    def __str__(self):
        return f"{self.custom_name}"
