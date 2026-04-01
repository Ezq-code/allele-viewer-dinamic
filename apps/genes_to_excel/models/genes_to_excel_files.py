import os
import logging
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.business_app.models import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.genes_to_excel.tasks import process_genes_to_excel_file_task

logger = logging.getLogger(__name__)


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/genes_to_excel_files/{filename}"


def user_processed_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/genes_to_excel_processed_files/{filename}"


@deconstructible
class FileExtensionValidator:
    def __call__(self, value):
        extensions = AllowedExtensions.objects.values_list("extension", flat=True)
        ext = os.path.splitext(value.name)[1]
        if ext.lower() not in extensions:
            raise ValidationError(f"File type '{ext}' is not supported.")


class GenesToExcelFiles(models.Model):
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
    file = models.FileField(
        verbose_name=_("Original File"),
        upload_to=user_directory_path,
        validators=[FileExtensionValidator()],
    )
    system_user = models.ForeignKey(
        "users_app.SystemUser",
        on_delete=models.CASCADE,
        related_name="genes_to_excel_files",
    )
    gene = models.ForeignKey(
        Gene,
        on_delete=models.CASCADE,
        null=True,
        related_name="genes_to_excel_files",
    )
    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,  # Set the field to now every time the object is first created
    )

    class Meta:
        verbose_name = _("Genes to excel uploaded File")
        verbose_name_plural = _("Genes to excel uploaded Files")

    def __str__(self):
        return f"{self.gene.name} - {self.custom_name}"

    def save(self, *args, **kwargs):
        file = self.file
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Call the "real" save() method.

        if is_new and file:
            try:
                process_genes_to_excel_file_task.delay(file.path, self.id)

            except Exception as e:
                logger.error(e)
                self.delete()
                raise e

    def delete(self, *args, **kwargs):
        # Delete the physical file before deleting the record
        self.delete_physical_file(self.file)
        super().delete(*args, **kwargs)

    def delete_physical_file(self, file_field):
        if file_field:
            file_path = file_field.path
            if os.path.exists(file_path):
                os.remove(file_path)
