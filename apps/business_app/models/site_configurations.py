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
    nx_graph_k = models.FloatField(verbose_name=_("Nx Graph K constant"), default=0.50)
    nx_graph_training_iterations = models.PositiveSmallIntegerField(
        verbose_name=_("Nx Graph Training iterations"), default=10
    )
    nx_graph_scale = models.PositiveSmallIntegerField(
        verbose_name=_("Nx Graph Scale"), default=500
    )

    def __str__(self):
        return self.viewer_representation_mode

    class Meta:
        verbose_name = _("Site Configuration")
