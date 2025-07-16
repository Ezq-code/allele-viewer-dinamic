from django.contrib import admin
import logging


from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo

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
