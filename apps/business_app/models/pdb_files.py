import os

from django.db import models
from django.utils.translation import gettext_lazy as _


def user_processed_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    to_return = f"user_{instance.original_file.system_user_id}/"
    to_return += f"processed_files/pdb_for_file_{instance.original_file.id}/{filename}"
    return to_return


class PdbFiles(models.Model):
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

    class Meta:
        verbose_name = _("PDB File")
        verbose_name_plural = _("PDB Files")

    def __str__(self):
        return f"{self.custom_name}"

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
