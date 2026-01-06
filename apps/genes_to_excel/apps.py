from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class GenesToExcelConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.genes_to_excel"
    verbose_name = _("Genes to Excel")
