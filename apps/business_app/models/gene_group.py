from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.business_app.models.gene import Gene


class GeneGroups(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    genes = models.ManyToManyField(Gene, related_name="groups")

    class Meta:
        verbose_name = _("Gene Group")
        verbose_name_plural = _("Gene Groups")

    def __str__(self):
        return f"{self.name}"
