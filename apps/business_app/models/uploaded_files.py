import os

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.business_app.models import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.business_app.models.initial_file_data import InitialFileData
from apps.business_app.utils.upload_to_google_drive_api import UploadToGoogleDriveApi
from apps.business_app.utils.xslx_to_pdb import XslxToPdb
from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph
from apps.business_app.models.site_configurations import SiteConfiguration
from django.core.cache import cache


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/origin_files/{filename}"


def user_processed_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f"user_{instance.system_user.id}/processed_files/{filename}"


@deconstructible
class FileExtensionValidator:
    def __call__(self, value):
        extensions = AllowedExtensions.objects.values_list("extension", flat=True)
        ext = os.path.splitext(value.name)[1]
        if ext.lower() not in extensions:
            raise ValidationError(f"File type '{ext}' is not supported.")


class UploadedFiles(models.Model):
    CACHE_KEY_RELATED_ALLELE_NODES = "allele_nodes_for_{uploaded_file_id}"
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
    original_file = models.FileField(
        verbose_name=_("Original File"),
        upload_to=user_directory_path,
        validators=[FileExtensionValidator()],
    )
    system_user = models.ForeignKey(
        "users_app.SystemUser",
        on_delete=models.CASCADE,
        related_name="uploaded_files",
    )
    predefined = models.BooleanField(
        verbose_name=_("predefined"),
        default=False,
    )
    gene = models.ForeignKey(
        Gene,
        on_delete=models.CASCADE,
        null=True,
        related_name="uploaded_files",
    )
    google_sheet_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default=None,
        unique=True,
    )
    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        auto_now_add=True,  # Set the field to now every time the object is first created
    )

    class Meta:
        verbose_name = _("Uploaded File")
        verbose_name_plural = _("Uploaded Files")

    def __str__(self):
        return f"{self.custom_name}"

    def save(self, *args, **kwargs):
        original_file = self.original_file
        is_new = self.pk is None
        file_name, extension = os.path.splitext(original_file.name)
        super().save(*args, **kwargs)  # Call the "real" save() method.
        if (
            extension == ".pdb"
            or InitialFileData.objects.filter(uploaded_file_id=self.pk).exists()
        ):
            return

        elif is_new and original_file:
            try:
                global_configuration = SiteConfiguration.get_solo()

                processor_classes = [XslxToPdb, XslxToPdbGraph]
                for processor_class in processor_classes:
                    processor_object = processor_class(
                        original_file, global_configuration
                    )
                    # Process the file and get the processed content
                    if global_configuration.upload_to_drive or isinstance(
                        processor_object, XslxToPdbGraph
                    ):
                        processor_object.proccess_initial_file_data(self.id)
                    processor_object.proccess_pdb_file(self.id, file_name)
                    # if isinstance(processor_object, XslxToPdb):
                    #     # Upload the file to Google Drive
                    #     processor = UploadToGoogleDriveApi()
                    #     sheet_id = processor.upload_file_to_google_drive(
                    #         original_file.path
                    #     )
                    #     print(sheet_id)
                    #     self.google_sheet_id = sheet_id
                    #     self.save(force_update=True, update_fields=["google_sheet_id"])

            except Exception as e:
                print(e)
                self.delete()
                raise e
        if self.predefined:
            UploadedFiles.objects.filter(gene=self.gene).exclude(id=self.id).update(
                predefined=False
            )

    def delete(self, *args, **kwargs):
        # Delete the physical file before deleting the record
        self.delete_physical_file(self.original_file)
        if self.google_sheet_id:
            processor = UploadToGoogleDriveApi()
            processor.delete_file_from_google_drive(self.google_sheet_id)
        cache.delete(
            UploadedFiles.CACHE_KEY_RELATED_ALLELE_NODES.format(
                uploaded_file_id=self.id
            )
        )
        super().delete(*args, **kwargs)

    def delete_physical_file(self, file_field):
        if file_field:
            file_path = file_field.path
            if os.path.exists(file_path):
                os.remove(file_path)
