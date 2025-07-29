from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class EventAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.allele_formation"
    verbose_name = _("Allele Formation")
