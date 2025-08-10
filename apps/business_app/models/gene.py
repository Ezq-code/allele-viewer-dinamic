from django.db import models
from django.utils.translation import gettext_lazy as _


class Gene(models.Model):
    class Status(models.TextChoices):
        COMPLETED = "C", _("Completed")
        INCOMPLETED = "I", _("Not completed")

    name = models.CharField(unique=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=1,
        choices=Status.choices,
        default=Status.INCOMPLETED,
    )

    class Meta:
        verbose_name = _("Gene")
        verbose_name_plural = _("Genes")

    def __str__(self):
        return f"{self.name} ({self.status})"
