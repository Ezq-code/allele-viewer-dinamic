import logging

from django.contrib import admin
from solo.admin import SingletonModelAdmin

from apps.genes_to_excel.models import UploadedFiles


logger = logging.getLogger(__name__)

# Register your models here.

admin.site.register(SiteConfiguration, SingletonModelAdmin)
admin.site.register(Layer)




@admin.register(UploadedFiles)
class UploadedFilesAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "custom_name",
        "description",
        "original_file",
        "gene",
        "system_user",
    ]
    fields = [
        "custom_name",
        "description",
        "original_file",
        "gene",
        "system_user",
    ]

    def save_model(self, request, obj, form, change):
        try:
            obj.save()
        except Exception as e:
            logger.error(f"{str(e)}")
            # Display the exception in the admin interface
            self.message_user(request, f"{str(e)}", level="error")

