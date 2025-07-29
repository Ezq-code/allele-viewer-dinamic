from django.db import models
from django.utils.translation import gettext_lazy as _
from colorfield.fields import ColorField

from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo


class VirtualAlleleFormationInfo(models.Model):
    allele = models.ForeignKey(AlleleSNPInfo, on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(verbose_name=_("Order"))
    formation = models.TextField(verbose_name="Formation")
    color = ColorField(_("Color"), default="#808080")  # gris

    class Meta:
        verbose_name = _("Virtual Allele Formation Information")
        verbose_name_plural = _("Virtual Alleles Formation Information")
        abstract = True  # No persiste en BD

    def __str__(self):
        return f"{self.allele} - {self.order}"
