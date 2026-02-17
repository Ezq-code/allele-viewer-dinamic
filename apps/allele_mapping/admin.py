import logging

from django.contrib import admin

from apps.allele_mapping.models.allele_mapping_files import AlleleMappingFiles
from apps.allele_mapping.models.allele_to_map import AlleleToMap
from apps.allele_mapping.models.allele_region_info import AlleleRegionInfo
from apps.allele_mapping.models.allele_region import AlleleRegion


logger = logging.getLogger(__name__)

# Register your models here.


@admin.register(AlleleMappingFiles)
class AlleleMappingFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "description",
        "file",
        "system_user",
    ]
    fields = [
        "description",
        "file",
        "system_user",
    ]

    def save_model(self, request, obj, form, change):
        try:
            obj.save()
        except Exception as e:
            logger.error(f"{str(e)}")
            # Display the exception in the admin interface
            self.message_user(request, f"{str(e)}", level="error")


@admin.register(AlleleToMap)
class AlleleToMapAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
        "file",
        "gene",
    ]
    fields = [
        "name",
        "file",
        "gene",
    ]


@admin.register(AlleleRegionInfo)
class AlleleRegionInfoAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "allele",
        "region",
        "percent_of_individuals",
        "allele_frequency",
        "sample_size",
    ]
    fields = [
        "allele",
        "region",
        "percent_of_individuals",
        "allele_frequency",
        "sample_size",
    ]


@admin.register(AlleleRegion)
class AlleleRegionAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "population",
        "sub_country",
        "location",
        "lat",
        "lon",
    ]
    fields = [
        "population",
        "sub_country",
        "location",
        "lat",
        "lon",
    ]
