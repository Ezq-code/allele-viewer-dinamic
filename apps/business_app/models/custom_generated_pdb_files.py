import os

from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomGeneratedPdbFiles(models.Model):
    custom_name = models.CharField(
        verbose_name=_("custom name"),
        max_length=150,
    )
    description = models.TextField(
        verbose_name=_("description"),
        default=_("Created due to user custom input."),
        max_length=150,
        blank=True,
        null=True,
    )
    original_file = models.ForeignKey(
        verbose_name=_("Original File"),
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="custom_generated_pdb_files",
    )

    file = models.FileField(
        verbose_name=_("Processed File"),
        upload_to="generated_pdb/",
    )
    system_user = models.ForeignKey(
        "users_app.SystemUser",
        on_delete=models.CASCADE,
        related_name="custom_generated_pdb_files",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Custom PDB File")
        verbose_name_plural = _("Custom PDB Files")

    def __str__(self):
        return f"{self.custom_name} - {self.system_user}"

    def delete(self, *args, **kwargs):
        # Delete the physical file before deleting the record
        self.delete_phisical_file(self.file)
        # Call the parent's delete method to remove the record from the database
        super().delete(*args, **kwargs)

    def delete_phisical_file(self, file_field):
        if file_field:
            file_path = file_field.path
            if os.path.exists(file_path):
                os.remove(file_path)
