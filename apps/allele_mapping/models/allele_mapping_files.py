import os

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.business_app.models import AllowedExtensions
from apps.allele_mapping.tasks import process_allele_mapping_file


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/allele_mapping_files/{filename}"


def user_processed_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/allele_mapping_processed_files/{filename}"


@deconstructible
class FileExtensionValidator:
    def __call__(self, value):
        extensions = AllowedExtensions.objects.values_list("extension", flat=True)
        ext = os.path.splitext(value.name)[1]
        if ext.lower() not in extensions:
            raise ValidationError(f"File type '{ext}' is not supported.")


class AlleleMappingFiles(models.Model):
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
        related_name="allele_mapping_files",
    )

    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,  # Set the field to now every time the object is first created
    )

    class Meta:
        verbose_name = _("Allele mapping uploaded File")
        verbose_name_plural = _("Allele mapping uploaded Files")

    def save(self, *args, **kwargs):
        file = self.file
        is_new = self.pk is None
        file_name, extension = os.path.splitext(file.name)
        super().save(*args, **kwargs)  # Call the "real" save() method.

        if is_new and file:
            try:
                # Ejecutar procesamiento asíncrono con Celery
                process_allele_mapping_file.delay(file.path, self.id)

            except Exception as e:
                print(e)
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
