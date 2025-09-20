import logging

from django.contrib import admin
from solo.admin import SingletonModelAdmin

from apps.business_app.models import (
    AlleleNode,
    AllowedExtensions,
    Event,
    EventGallery,
    Feature,
    Layer,
    Marker,
    SiteConfiguration,
    UploadedFiles,
    WorkingCopyOfOriginalFile,
)
from apps.business_app.models.event_type import EventType
from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.models.initial_file_data import InitialFileData
from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry

logger = logging.getLogger(__name__)

# Register your models here.

admin.site.register(SiteConfiguration, SingletonModelAdmin)
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


@admin.register(EventGallery)
class EventGalleryAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = ["id", "name", "event", "image"]
    fields = ["name", "event", "image"]


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
        "frec_afr_amr",
        "frec_amr",
        "frec_csa",
        "frec_eas",
        "frec_eur",
        "frec_lat",
        "frec_nea",
        "frec_oce",
        "frec_ssa",
        "frec_afr_eas",
        "frec_afr_swe",
        "frec_afr_nor",
        "frec_ca",
        "frec_sa",
    ]
    fields = [
        "number",
        "element",
        "custom_element_name",
        "rs",
        "uploaded_file",
        "timeline_appearence",
        "frec_afr_amr",
        "frec_amr",
        "frec_csa",
        "frec_eas",
        "frec_eur",
        "frec_lat",
        "frec_nea",
        "frec_oce",
        "frec_ssa",
        "frec_afr_eas",
        "frec_afr_swe",
        "frec_afr_nor",
        "frec_ca",
        "frec_sa",
    ]


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
        "icon",
        "pause_time",
    ]
    fields = [
        "name",
        "icon",
        "pause_time",
    ]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "event_name",
        "event_icon",
        "pause_time",
        "event_type",
        "description",
        "start_date",
        "end_date",
        "reference",
    ]
    fields = [
        "event_name",
        "event_icon",
        "pause_time",
        "event_type",
        "description",
        "start_date",
        "end_date",
        "reference",
    ]


@admin.register(Marker)
class MarkerAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "latitude",
        "longitude",
        "event",
    ]
    fields = [
        "latitude",
        "longitude",
        "event",
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


@admin.register(Gene)
class GeneAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
        "description",
        "status",
    ]
    fields = [
        "name",
        "description",
        "status",
    ]
    search_fields = ("name",)


@admin.register(GeneGroups)
class GeneGroupsAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    filter_horizontal = ("genes",)

    list_display = [
        "id",
        "name",
        "description",
    ]
    fields = [
        "name",
        "description",
    ]
    search_fields = ("name",)


@admin.register(UploadedFiles)
class UploadedFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "custom_name",
        "description",
        "original_file",
        "gene",
        "predefined",
        "system_user",
        "google_sheet_id",
    ]
    fields = [
        "custom_name",
        "description",
        "original_file",
        "gene",
        "predefined",
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
        "color",
        "name",
        "symbol",
    ]
    fields = [
        "color",
        "name",
        "symbol",
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


@admin.register(GeneStatus)
class GeneStatusAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
        "description",
        "type",
        "requires_evidence",
    ]
    fields = [
        "name",
        "description",
        "type",
        "requires_evidence",
    ]


@admin.register(GeneStatusMiddle)
class GeneStatusMiddleAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "gene",
        "gene_status",
        "evidence",
        "value",
    ]
    fields = [
        "gene",
        "gene_status",
        "evidence",
        "value",
    ]
