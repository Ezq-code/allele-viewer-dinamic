# models.py


from django.db import models
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel
from django.core.cache import cache



class SiteConfiguration(SingletonModel):
    viewer_representation_mode = models.CharField(
        verbose_name=_("Viewer Representation mode"), max_length=150
    )
    example_file = models.FileField(
        verbose_name=_("Example File"), upload_to="conf_files/", null=True, blank=True
    )
    upload_to_drive = models.BooleanField(default=False)
    nx_graph_k = models.FloatField(verbose_name=_("Nx Graph K constant"), default=0.50)
    nx_graph_training_iterations = models.PositiveSmallIntegerField(
        verbose_name=_("Nx Graph Training iterations"), default=10
    )
    nx_graph_scale = models.PositiveSmallIntegerField(
        verbose_name=_("Nx Graph Scale"), default=500
    )

    sphere_radius_factor = models.FloatField(default=12)

    stick_radius_factor = models.FloatField(default=0.003)
    stick_radius_min_value = models.FloatField(default=0.2)
    stick_radius_if_children = models.FloatField(default=0.5)

    def __str__(self):
        return self.viewer_representation_mode

    class Meta:
        verbose_name = _("Site Configuration")

    def save(self, *args, **kwargs):
        cache.clear()
        return super().save(*args, **kwargs)
