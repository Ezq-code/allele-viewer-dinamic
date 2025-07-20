from django.contrib import admin
import logging


from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles

logger = logging.getLogger(__name__)

# Register your models here.


@admin.register(AlleleSNPInfo)
class AlleleSNPInfoAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "parents_info",
        "allele",
        "loss_ancesters_snp",
        "increment_ancesters_snp",
        "loss_location_snp",
        "increment_location_snp",
    ]
    fields = [
        "parents_info",
        "allele",
        "loss_ancesters_snp",
        "increment_ancesters_snp",
        "loss_location_snp",
        "increment_location_snp",
    ]


@admin.register(UploadedSNPFiles)
class UploadedSNPFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "custom_name",
        "description",
        "snp_file",
        "system_user",
    ]
    fields = [
        "custom_name",
        "description",
        "snp_file",
        "system_user",
    ]
