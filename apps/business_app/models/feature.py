from django.db import models
from django.utils.translation import gettext_lazy as _


class Feature(models.Model):
    feature_type = models.CharField(max_length=255, verbose_name=_("FeatureType"), default='Feature')
    feature_id = models.IntegerField(verbose_name=_("ID"))
    mag = models.CharField(max_length=255, verbose_name=_("Mag"), null=True, blank=True)
    place = models.CharField(max_length=255, verbose_name=_("Place"), null=True, blank=True)
    time = models.IntegerField(verbose_name=_("Time") , null=True, blank=True)
    title = models.CharField(max_length=255, verbose_name=_("Title"), null=True, blank=True)
    timefinal = models.IntegerField(verbose_name=_("TimeFinal"), null=True, blank=True)
    geometry_type = models.CharField(max_length=255, verbose_name=_("GeometryType"), null=True, blank=True)
    coordinates = models.JSONField(verbose_name=_("Coordinates"), null=True, blank=True)

    def __str__(self):
        return f"Feature ID: {self.feature_id} - {self.title}"

