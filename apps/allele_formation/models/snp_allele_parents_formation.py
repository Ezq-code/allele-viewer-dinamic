from django.utils.translation import gettext_lazy as _

from apps.allele_formation.models.snp_formation_information import (
    VirtualAlleleFormationInfo,
)


class SNPAlleleParentsFormation(VirtualAlleleFormationInfo):
    class Meta:
        verbose_name = _("SNP Allele Parent Formation")
        verbose_name_plural = _("SNP Alleles Parent Formation")
