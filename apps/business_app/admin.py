from django.contrib import admin
from solo.admin import SingletonModelAdmin
import logging


from apps.business_app.models import (
    AllowedExtensions,
    SiteConfiguration,
    UploadedFiles,
    AlleleNode,
    Marker,
    MarkerGallery,
    Event,
    Layer,
    Feature,
    WorkingCopyOfOriginalFile,
)
from apps.business_app.models.initial_file_data import InitialFileData
from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry

logger = logging.getLogger(__name__)

# Register your models here.

admin.site.register(SiteConfiguration, SingletonModelAdmin)
admin.site.register(Event)
admin.site.register(Marker)
admin.site.register(MarkerGallery)
admin.site.register(Layer)


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "feature_type",
        "mag",
        "place",
        "time",
        "title",
        "timefinal",
        "geometry_type",
        "coordinates",
    ]
    fields = [
        "feature_type",
        "mag",
        "place",
        "time",
        "title",
        "timefinal",
        "geometry_type",
        "coordinates",
    ]


@admin.register(AlleleNode)
class AlleleNodeAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "number",
        "unique_number",
        "element",
        "custom_element_name",
        "rs",
        "uploaded_file",
        "timeline_appearence",
    ]
    fields = [
        "number",
        "element",
        "custom_element_name",
        "rs",
        "uploaded_file",
        "timeline_appearence",
    ]


@admin.register(AllowedExtensions)
class AllowedExtensionsAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "extension",
        "typical_app_name",
    ]
    fields = [
        "extension",
        "typical_app_name",
    ]


@admin.register(UploadedFiles)
class UploadedFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "custom_name",
        "description",
        "original_file",
        "system_user",
        "google_sheet_id",
    ]
    fields = [
        "custom_name",
        "description",
        "original_file",
        "system_user",
        "google_sheet_id",
    ]

    def save_model(self, request, obj, form, change):
        try:
            obj.save()
        except Exception as e:
            logger.error(f"{str(e)}")
            # Display the exception in the admin interface
            self.message_user(request, f"{str(e)}", level="error")


@admin.register(PdbFiles)
class PdbFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "custom_name",
        "description",
        "original_file",
        "pdb_content",
        "kind",
    ]
    fields = [
        "custom_name",
        "description",
        "kind",
    ]


@admin.register(WorkingCopyOfOriginalFile)
class WorkingCopyOfOriginalFileAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "system_user",
        "uploaded_file",
        "pdb_file_copy",
    ]
    fields = [
        "id",
        "uploaded_file",
    ]


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
    ]
    fields = [
        "name",
    ]


@admin.register(RegionCountry)
class RegionCountryAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "region",
        "country",
    ]
    fields = [
        "region",
        "country",
    ]


@admin.register(InitialFileData)
class InitialFileDataAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "row_index",
        "allele",
        "marker",
        "original_value",
        "min_value",
        "max_value",
        "uploaded_file_id",
    ]
    fields = [
        "allele",
        "marker",
        "min_value",
        "max_value",
        "uploaded_file",
    ]
