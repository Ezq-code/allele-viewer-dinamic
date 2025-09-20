from django.db import models
from django.utils.translation import gettext_lazy as _


class GeneStatus(models.Model):
    class TypeRepresentation(models.TextChoices):
        PERCENT = "P", _("Percent")
        BOOLEAN = "B", _("Boolean")

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(
        max_length=1,
        choices=TypeRepresentation.choices,
        default=TypeRepresentation.PERCENT,
    )
    requires_evidence = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Gene status")
        verbose_name_plural = _("Gene status")

    def __str__(self):
        return f"{self.name} ({self.type})"
