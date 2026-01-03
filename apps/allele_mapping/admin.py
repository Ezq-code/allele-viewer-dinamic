import logging

from django.contrib import admin

from apps.allele_mapping.models.allele_mapping_files import AlleleMappingFiles


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
