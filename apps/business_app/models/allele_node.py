from django.db import models
from django.utils.translation import gettext_lazy as _


class AlleleNode(models.Model):
    number = models.PositiveIntegerField(verbose_name=_("Number"))
    unique_number = models.CharField(
        verbose_name=_("Unique Number"), unique=True, max_length=100
    )
    element = models.CharField(verbose_name=_("Element"), max_length=3)
    custom_element_name = models.CharField(
        verbose_name=_("Custom Element Name"), null=True, blank=True, max_length=150
    )
    region = models.CharField(
        verbose_name=_("Region"), max_length=100, null=True, blank=True
    )
    rs = models.TextField(
        verbose_name=_("RS"),
    )
    children = models.ManyToManyField("self", symmetrical=False, blank=True)
    uploaded_file = models.ForeignKey(
        to="UploadedFiles",
        on_delete=models.CASCADE,
        related_name="allele_nodes",
    )
    timeline_appearence = models.IntegerField(
        verbose_name="Appearance on the timeline", null=True
    )
    origin_1 = models.IntegerField(
        verbose_name="Origin 1",
        null=True,
        help_text="First value in the appereance range",
    )
    origin_2 = models.IntegerField(
        verbose_name="Appearance on the timeline",
        null=True,
        help_text="Last value in the appereance range",
    )
    sphere_radius = models.FloatField(verbose_name=_("Sphere Radius"), null=True)
    stick_radius = models.FloatField(verbose_name=_("Stick Radius"), null=True)

    class Meta:
        verbose_name = _("Allele Node")
        verbose_name_plural = _("Allele Nodes")

    def __str__(self):
        return f"{self.number}-{self.custom_element_name}"
