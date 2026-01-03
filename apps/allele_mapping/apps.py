from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AlleleMappingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.allele_mapping"
    verbose_name = _("Allele Mapping")
