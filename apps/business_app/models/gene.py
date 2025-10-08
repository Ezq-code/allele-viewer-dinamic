from django.db import models
from django.utils.translation import gettext_lazy as _


class Gene(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    status = models.SmallIntegerField(default=0)

    class Meta:
        verbose_name = _("Gene")
        verbose_name_plural = _("Genes")

    def __str__(self):
        return f"{self.name}"
