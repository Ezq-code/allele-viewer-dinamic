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

    name = models.CharField(
        verbose_name=_("Name"),
        max_length=100,
    )
    sheet_name = models.CharField(
        verbose_name=_("Sheet Name"),
        max_length=100,
    )

    class Meta:
        verbose_name = _("Study Type")
        verbose_name_plural = _("Study Types")

    def __str__(self):
        return self.name
