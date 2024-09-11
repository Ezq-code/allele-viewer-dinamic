from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.custom_generated_pdb_files import CustomGeneratedPdbFiles
from apps.business_app.utils.upload_to_google_drive_api import UploadToGoogleDriveApi


class WorkingCopyOfOriginalFile(models.Model):
    system_user = models.ForeignKey(
        "users_app.SystemUser",
        on_delete=models.CASCADE,
    )
    uploaded_file = models.ForeignKey(
        "business_app.UploadedFiles",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,  # Set the field to now every time the object is first created
    )
    google_sheet_id_copy = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )
    pdb_file_copy = models.OneToOneField(
        to=CustomGeneratedPdbFiles,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = _("Uploaded File Copy")
        verbose_name_plural = _("Uploaded Files Copies")

    def __str__(self):
        return f"{self.pdb_file_copy}"

    def delete(self, *args, **kwargs):
        # Delete the physical file before deleting the record
        print("Deleting WorkingCopyOfOriginalFile object...")
        self.pdb_file_copy.delete()
        if self.google_sheet_id_copy:
            processor = UploadToGoogleDriveApi()
            processor.delete_file_from_google_drive(self.google_sheet_id_copy)
        super().delete(*args, **kwargs)
