from django.db import models
from django.utils.translation import gettext_lazy as _


class AlleleSNPInfo(models.Model):
    parents_info = models.CharField(
        verbose_name=_("Parents Info"), null=True, max_length=256
    )
    allele = models.CharField(verbose_name=_("Allele"), max_length=100)
    transition = models.TextField(verbose_name=_("Transition"), null=True, blank=True)

    loss_ancesters_snp = models.TextField(
        null=True, blank=True, verbose_name=_("SNP lost (Ancesters)")
    )
    increment_ancesters_snp = models.TextField(
        null=True, blank=True, verbose_name=_("SNP increment (Ancesters)")
    )

    loss_location_snp = models.TextField(
        null=True, blank=True, verbose_name=_("SNP lost (Location)")
    )
    increment_location_snp = models.TextField(
        null=True, blank=True, verbose_name=_("SNP increment (Location)")
    )
    uploaded_file = models.ForeignKey(
        to="UploadedSNPFiles",
        on_delete=models.CASCADE,
        related_name="allele_snp_info",
        verbose_name=_("Uploaded SNP File"),
    )

    class Meta:
        verbose_name = _("Allele SNP Information")
        verbose_name_plural = _("Alleles SNP Information")
        constraints = [
            models.UniqueConstraint(
                fields=["allele", "uploaded_file"],
                name="unique_allele_uploaded_file",
            )
        ]

    def __str__(self):
        return self.allele
