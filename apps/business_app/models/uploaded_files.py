import os
import logging

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.business_app.models import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.business_app.models.initial_file_data import InitialFileData
from apps.business_app.models.base_allele_node import BaseAlleleNode
from apps.business_app.tasks import proccess_individual_processor_class
from apps.business_app.utils.upload_to_google_drive_api import UploadToGoogleDriveApi
from django.core.cache import cache
from django.db import close_old_connections
from apps.business_app.utils.xslx_to_pdb_by_allele_study import XslxToPdbByAlleleStudy

from apps.business_app.utils.xslx_to_pdb_by_ancesters_plus_est_study import (
    XslxToPdbByAncestersPlusEstStudy,
)
from apps.business_app.utils.xslx_to_pdb_by_ancesters_minus_est_study import (
    XslxToPdbByAncestersMinusEstStudy,
)
from apps.business_app.utils.xslx_to_pdb_by_location_plus_est_study import (
    XslxToPdbByLocationPlusEstStudy,
)
from apps.business_app.utils.xslx_to_pdb_by_location_minus_est_study import (
    XslxToPdbByLocationMinusEstStudy,
)


logger = logging.getLogger(__name__)


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
    processed = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Uploaded File")
        verbose_name_plural = _("Uploaded Files")

    def __str__(self):
        return f"{self.custom_name}"

    def save(self, *args, **kwargs):
        original_file = self.original_file
        is_new = self.pk is None
        _, extension = os.path.splitext(original_file.name)
        super().save(*args, **kwargs)  # Call the "real" save() method.
        if (
            extension == ".pdb"
            or InitialFileData.objects.filter(uploaded_file_id=self.pk).exists()
        ):
            return

        elif is_new and original_file:
            try:
                self.process_uploaded_file()
            except Exception as e:
                logger.exception(f"An error occurred: {e}", exc_info=True)
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
        # Clean up graph cache for all studies associated with this file
        for study in self.studies.all():
            graph_cache_key = BaseAlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(
                study_id=study.id
            )
            cache.delete(graph_cache_key)
        super().delete(*args, **kwargs)

    def delete_physical_file(self, file_field):
        if file_field:
            file_path = file_field.path
            if os.path.exists(file_path):
                os.remove(file_path)

    def process_uploaded_file(self):
        close_old_connections()

        # processor_classes = [XslxToPdbByAlleleStudy, XslxToPdbGraph]
        processor_classes = [
            XslxToPdbByAlleleStudy,
            XslxToPdbByAncestersPlusEstStudy,
            XslxToPdbByAncestersMinusEstStudy,
            XslxToPdbByLocationPlusEstStudy,
            XslxToPdbByLocationMinusEstStudy,
        ]
        for processor_class in processor_classes:
            proccess_individual_processor_class.delay(processor_class.__name__, self.id)

        # if successful_processors == 0 and last_error is not None:
        #     send_pusher_trigger_task.delay(
        #         channel=PusherClient.CELERY_TASK_CHANNEL,
        #         event=PusherClient.FAILED_UPLOAD_3D_EXCEL,
        #         data={"error_detail": error_message_to_show},
        #     )
        #     raise Exception(error_message_to_show)

        # if successful_processors > 0:
        #     uploaded_file.processed = True
        #     uploaded_file.save(update_fields=["processed"])

        # send_pusher_trigger_task.delay(
        #     channel=PusherClient.CELERY_TASK_CHANNEL,
        #     event=PusherClient.SUCCESSFUL_UPLOAD_3D_EXCEL,
        #     data={"uploaded_file_id": uploaded_file_id},
        # )
        # uploaded_file.delete()
        # return {"status": "success", "uploaded_file_id": uploaded_file_id}
