from django.utils.translation import gettext_lazy as _

from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.models.snp_formation_information import (
    VirtualAlleleFormationInfo,
)
from django.db import models


class SNPAlleleLocationFormation(VirtualAlleleFormationInfo):
    allele = models.ForeignKey(
        AlleleSNPInfo, on_delete=models.CASCADE, related_name="location_formation"
    )

    class Meta:
        verbose_name = _("SNP Allele Location Formation")
        verbose_name_plural = _("SNP Alleles Location Formation")
