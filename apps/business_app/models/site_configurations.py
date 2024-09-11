# models.py


from django.db import models
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel


class SiteConfiguration(SingletonModel):
    viewer_representation_mode = models.CharField(
        verbose_name=_("Viewer Representation mode"), max_length=150
    )
    example_file = models.FileField(
        verbose_name=_("Example File"), upload_to="conf_files/", null=True, blank=True
    )

    def __str__(self):
        return self.viewer_representation_mode

    class Meta:
        verbose_name = _("Site Configuration")
