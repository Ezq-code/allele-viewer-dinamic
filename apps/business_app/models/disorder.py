from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.disease_subgroup import DiseaseSubGroup


class Disorder(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    disease_subgroup = models.ForeignKey(to=DiseaseSubGroup, on_delete=models.CASCADE)

    class Meta:
        verbose_name = _("Disorder")
        verbose_name_plural = _("Disorders")

    def __str__(self):
        return f"{self.name}"
