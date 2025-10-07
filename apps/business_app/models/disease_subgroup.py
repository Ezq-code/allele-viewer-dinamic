from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.disease_group import DiseaseGroup


class DiseaseSubGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    disease_group = models.ForeignKey(
        to=DiseaseGroup, on_delete=models.CASCADE, related_name="subgroups"
    )

    class Meta:
        verbose_name = _("Disease SubGroup")
        verbose_name_plural = _("Disease SubGroups")

    def __str__(self):
        return f"{self.name}"
