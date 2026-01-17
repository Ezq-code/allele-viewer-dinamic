import logging

import pandas as pd

from apps.genes_to_excel.utils.excel_structure_validator import ExcelStructureValidator
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.gen_data import CaracteristicaGen



logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

    # def proccess_file(self, uploaded_file_id, gene):
    #    print("Proccessing file data...")

    #@staticmethod
    @staticmethod
    def proccess_file(df, nombre_archivo):
        print("Proccessing file data...")
        resultados = {
            "genes_procesados": 0,
            "caracteristicas_guardadas": 0,
            "errores": [],
        }

        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    gene_nombre = str(row["Gene"]).strip()
                    if not gene_nombre:
                        continue

                    # Crear o obtener el gen
                    gen, gen_created = Gene.objects.get_or_create(name=gene_nombre)

                    if gen_created:
                        print(f"Nuevo gen: {gene_nombre}")
                        resultados["genes_procesados"] += 1

                    # Preparar datos para CaracteristicaGen
                    defaults = {
                        'archivo_origen': nombre_archivo,
                        'gene': gene_nombre,
                        'valor': str(row["Valor"]).strip() if pd.notna(row["Valor"]) else "",
                        'color': str(row["Color"]).strip() if pd.notna(row["Color"]) else "",
                        'protein': str(row["Protein"]).strip() if pd.notna(row["Protein"]) else "",
                        'alleleasoc': str(row["Alleleasoc"]).strip() if pd.notna(row["Alleleasoc"]) else "",
                        'species': str(row["Species"]).strip() if pd.notna(row["Species"]) else "",
                        'variant': str(row["Variant"]).strip() if pd.notna(row["Variant"]) else "",
                    }
                    
                    cord_valor = str(row["Cord"]).strip() if pd.notna(row["Cord"]) else ""
                    
                    # Usar get_or_create para evitar errores de unicidad
                    caracteristica, creada = CaracteristicaGen.objects.get_or_create(
                        gen=gen,
                        cord=cord_valor,
                        defaults=defaults
                    )
                    
                    if not creada:
                        # Si ya existe, actualizar los campos
                        for key, value in defaults.items():
                            setattr(caracteristica, key, value)
                        caracteristica.save()
                        print(f"Actualizado.....{index}")
                    else:
                        print(f"Guardado.....{index}")
                    
                    resultados["caracteristicas_guardadas"] += 1

                except Exception as e:
                    resultados["errores"].append({
                        "fila": index + 2,
                        "error": str(e),
                        "gene": gene_nombre if 'gene_nombre' in locals() else "N/A"
                    })
                    # Continuar con la siguiente fila
                    continue

        return resultados
