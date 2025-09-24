from django.db import models
from django.utils.translation import gettext_lazy as _


class DeseaseGroup(models.Model):

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    

    class Meta:
        verbose_name = _("DeseaseGroup")
        verbose_name_plural = _("DeseaseGroups")

    def __str__(self):
        return f"{self.name}"
