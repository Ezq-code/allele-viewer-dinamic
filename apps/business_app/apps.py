from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class EventAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.business_app"
    verbose_name = _("Allele Application")

    def ready(self):
        # Importing signals in ready ensures receivers are registered once app is loaded.
        from . import signals  # noqa: F401
