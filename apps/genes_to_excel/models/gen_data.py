from django.db import models

from apps.business_app.models.gene import Gene

# Create your models here.


class CaracteristicaGen(models.Model):
    gen = models.ForeignKey(
        Gene, on_delete=models.CASCADE, related_name="caracteristicas"
    )
    # Campo para identificar el archivo Excel de origen
    archivo_origen = models.CharField(
        max_length=255, help_text="Nombre del archivo Excel de origen"
    )
    gene = models.CharField(max_length=100, blank=True)
    cord = models.CharField(max_length=50, blank=True)
    valor = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=50, blank=True)
    protein = models.CharField(max_length=100, blank=True)
    alleleasoc = models.TextField(blank=True)
    species = models.CharField(max_length=100, blank=True)
    variant = models.CharField(max_length=100, blank=True)
    order=models.CharField(max_length=100, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.gene} - {self.cord} - {self.valor}"

    class Meta:
        verbose_name = "Característica del Gen"
        verbose_name_plural = "Características de los Genes"
        db_table = "caracteristicas_gen"
        # Restricción de unicidad para gen + cord
        constraints = [
            models.UniqueConstraint(
                fields=["gen", "cord"], name="unique_gen_cord_combination"
            )
        ]
        indexes = [
            models.Index(fields=["gene", "cord"]),
            models.Index(fields=["gene"]),
            models.Index(fields=["species"]),
        ]
