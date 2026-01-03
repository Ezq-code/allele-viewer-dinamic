import os

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from apps.allele_mapping.models.allele_mapping_files import AlleleMappingFiles
from apps.business_app.models.gene import Gene

class AlleleToMap(models.Model):
    name = models.CharField(
        verbose_name=_("name"),
        max_length=50,
    )
    file = models.ForeignKey(to=AlleleMappingFiles, on_delete=models.CASCADE, related_name="alleles")
    gene = models.ForeignKey(
        Gene,
        on_delete=models.CASCADE,
        related_name="allele_mapping_files",)

    class Meta:
        verbose_name = _("Allele to map")
        verbose_name_plural = _("Alleles to map")
    def __str__(self):
        return f"{self.name} ({self.gene.name})"