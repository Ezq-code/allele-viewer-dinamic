import logging

from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


class StudyType(models.Model):
    """
    Represents a type of study that can be associated with a Study instance.

    Replaces the previous TextChoices enum (STUDY_TYPE) on the Study model,
    allowing dynamic management of study types from the database.
    """

    STUDY_NAME_GENETIC_ALLELE = "Genetic Allele"
    SHEET_NAME_GENETIC_ALLELE = "For3DAllele"

    STUDY_NAME_LOCATION_PLUS_EST = "Location+Est"
    SHEET_NAME_LOCATION_PLUS_EST = "For3DProt_L+Est"

    STUDY_NAME_LOCATION_MINUS_EST = "Location-Est"
    SHEET_NAME_LOCATION_MINUS_EST = "For3DProt_L-Est"

    STUDY_NAME_ANCESTERS_PLUS_EST = "Ancesters+Est"
    SHEET_NAME_ANCESTERS_PLUS_EST = "For3DProt_A+Est"

    STUDY_NAME_ANCESTERS_MINUS_EST = "Ancesters-Est"
    SHEET_NAME_ANCESTERS_MINUS_EST = "For3DProt_A-Est"

    class CLASSIFICATION(models.TextChoices):
        ALLELE = "A", _("Allele")
        PROTEIN = "P", _("Protein")

    name = models.CharField(
        verbose_name=_("Name"),
        max_length=100,
    )
    sheet_name = models.CharField(
        verbose_name=_("Sheet Name"),
        max_length=100,
    )
    classification = models.CharField(
        verbose_name=_("Classification"),
        max_length=1,
        choices=CLASSIFICATION,
        default=CLASSIFICATION.ALLELE,
    )

    class Meta:
        verbose_name = _("Study Type")
        verbose_name_plural = _("Study Types")

    def __str__(self):
        return self.name
