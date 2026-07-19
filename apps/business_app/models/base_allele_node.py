from django.db import models
from django.utils.translation import gettext_lazy as _


class BaseAlleleNode(models.Model):
    """Abstract base model with shared node fields for allele-like entities."""

    CACHE_KEY_GRAPH_FOR_STUDY = "graph_for_{study_id}"
    CACHE_KEY_DESCENDANTS = "descendants_for_{study_id}-{number}"
    CACHE_KEY_SUCESSORS = "sucessors_for_{study_id}-{number}"
    CACHE_KEY_LIST_OR_SEARCH = "allele_nodes_list_{parent_lookup_key}{search_criteria}"

    study = models.ForeignKey(
        "Study",
        on_delete=models.CASCADE,
        verbose_name=_("Study ID"),
        null=True,
        blank=True,
    )
    number = models.PositiveIntegerField(verbose_name=_("Number"))

    unique_number = models.CharField(
        verbose_name=_("Unique Number"), unique=True, max_length=100
    )
    element = models.CharField(verbose_name=_("Element"), max_length=3)
    allele = models.CharField(
        verbose_name=_("Allele"), null=True, blank=True, max_length=150
    )
    rs = models.TextField(
        verbose_name=_("RS"),
    )
    region = models.CharField(
        verbose_name=_("Region"), max_length=100, null=True, blank=True
    )
    children = models.ManyToManyField("self", symmetrical=False, blank=True)
    predecessors = models.JSONField(default=list)
    sucessors = models.JSONField(default=list)

    timeline_appearence = models.IntegerField(
        verbose_name="Appearance on the timeline", null=True
    )
    age_1 = models.IntegerField(
        verbose_name="Appearance on the timeline",
        null=True,
        help_text="First value in the appereance range",
    )
    age_2 = models.IntegerField(
        verbose_name="Disappearance on the timeline",
        null=True,
        help_text="Last value in the appereance range",
    )
    order = models.PositiveSmallIntegerField(verbose_name=_("Order"), null=True)
    loss = models.TextField(null=True, verbose_name=_("RS lost"))
    increment = models.TextField(null=True, verbose_name=_("RS incremented"))
    sphere_radius = models.FloatField(verbose_name=_("Sphere Radius"), null=True)
    stick_radius = models.FloatField(verbose_name=_("Stick Radius"), null=True)

    frec_afr_amr = models.FloatField(
        verbose_name=_("Frequency African American/Afro-Caribbean"),
        null=True,
        blank=True,
    )
    frec_amr = models.FloatField(
        verbose_name=_("Frequency American"), null=True, blank=True
    )
    frec_csa = models.FloatField(
        verbose_name=_("Frequency Central/South-Asian"), null=True, blank=True
    )
    frec_eas = models.FloatField(
        verbose_name=_("Frequency East Asian"), null=True, blank=True
    )
    frec_eur = models.FloatField(
        verbose_name=_("Frequency European"), null=True, blank=True
    )
    frec_lat = models.FloatField(
        verbose_name=_("Frequency Latino"), null=True, blank=True
    )
    frec_nea = models.FloatField(
        verbose_name=_("Frequency Near Eastern"), null=True, blank=True
    )
    frec_oce = models.FloatField(
        verbose_name=_("Frequency Oceanian"), null=True, blank=True
    )
    frec_ssa = models.FloatField(
        verbose_name=_("Frequency Sub-Saharan African"), null=True, blank=True
    )
    frec_afr_eas = models.FloatField(
        verbose_name=_("Frequency East-African"), null=True, blank=True
    )
    frec_afr_swe = models.FloatField(
        verbose_name=_("Frequency South-West-African"), null=True, blank=True
    )
    frec_afr_nor = models.FloatField(
        verbose_name=_("Frequency North-African"), null=True, blank=True
    )
    frec_ca = models.FloatField(
        verbose_name=_("Frequency Central-Asian"), null=True, blank=True
    )
    frec_sa = models.FloatField(
        verbose_name=_("Frequency South-Asian"), null=True, blank=True
    )

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.number}-{self.allele}"
