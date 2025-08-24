import os
from venv import logger

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.allele_formation.utils.excel_snp_reader import ExcelSNPReader
from apps.business_app.models import AllowedExtensions
from apps.business_app.models.gene import Gene


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/snp_files/{filename}"


@deconstructible
class FileExtensionValidator:
    def __call__(self, value):
        extensions = AllowedExtensions.objects.values_list("extension", flat=True)
        ext = os.path.splitext(value.name)[1]
        if ext.lower() not in extensions:
            raise ValidationError(f"File type '{ext}' is not supported.")


class UploadedSNPFiles(models.Model):
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
    snp_file = models.FileField(
        verbose_name=_("Original File"),
        upload_to=user_directory_path,
        validators=[FileExtensionValidator()],
    )
    system_user = models.ForeignKey(
        "users_app.SystemUser",
        on_delete=models.CASCADE,
        related_name="snp_files",
    )
    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,  # Set the field to now every time the object is first created
    )
    predefined = models.BooleanField(
        verbose_name=_("predefined"),
        default=False,
    )
    gene = models.ForeignKey(
        Gene,
        on_delete=models.CASCADE,
        null=True,
        related_name="uploaded_formation_files",
    )

    class Meta:
        verbose_name = _("SNP File")
        verbose_name_plural = _("SNP Files")

    def __str__(self):
        return f"{self.custom_name}"

    def save(self, *args, **kwargs):
        snp_file = self.snp_file
        committed = snp_file._committed
        is_new = self.pk is None
        if committed is False and not is_new:
            self.delete()

        super().save(*args, **kwargs)  # Call the "real" save() method.

        if not committed:
            try:
                processor_object = ExcelSNPReader(snp_file)
                processor_object.proccess_sheets(self.id)

            except Exception as e:
                logger.error(e)
                self.delete()
                raise e

    def delete(self, *args, **kwargs):
        # Delete the physical file before deleting the record
        self.delete_phisical_file(self.snp_file)
        super().delete(*args, **kwargs)

    def delete_phisical_file(self, file_field):
        if file_field:
            file_path = file_field.path
            if os.path.exists(file_path):
                os.remove(file_path)
