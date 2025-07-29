from django.utils.translation import gettext_lazy as _

from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.models.snp_formation_information import (
    VirtualAlleleFormationInfo,
)
from django.db import models


class SNPAlleleAncesterFormation(VirtualAlleleFormationInfo):
    allele = models.ForeignKey(
        AlleleSNPInfo, on_delete=models.CASCADE, related_name="ancester_formation"
    )

    class Meta:
        verbose_name = _("SNP Allele Ancester Formation")
        verbose_name_plural = _("SNP Alleles Ancester Formation")
