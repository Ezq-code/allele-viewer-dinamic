from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.disease_subgroup import DiseaseSubGroup
from apps.business_app.models.gene import Gene


class Disorder(models.Model):
    name = models.CharField(max_length=250, unique=True)
    description = models.TextField(null=True, blank=True)
    disease_subgroup = models.ForeignKey(
        to=DiseaseSubGroup, on_delete=models.CASCADE, related_name="disorders"
    )
    genes = models.ManyToManyField(Gene, related_name="disorders")

    class Meta:
        verbose_name = _("Disorder")
        verbose_name_plural = _("Disorders")

    def __str__(self):
        return f"{self.name}"
