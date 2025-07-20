from django.utils.translation import gettext_lazy as _

from apps.allele_formation.models.snp_formation_information import (
    VirtualAlleleFormationInfo,
)


class SNPAlleleLocationFormation(VirtualAlleleFormationInfo):
    class Meta:
        verbose_name = _("SNP Allele Location Formation")
        verbose_name_plural = _("SNP Alleles Location Formation")
