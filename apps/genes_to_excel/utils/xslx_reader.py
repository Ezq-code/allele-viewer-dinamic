from django.core.cache import cache
import io
import logging

import pandas as pd

from apps.genes_to_excel.utils.excel_nomenclators import ExcelNomenclators
from apps.genes_to_excel.utils.excel_structure_validator import ExcelStructureValidator
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.gen_data import CaracteristicaGen

from rest_framework.decorators import action
from rest_framework import parsers, renderers
from django.db import transaction




logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

    #def proccess_file(self, uploaded_file_id, gene):
    #    print("Proccessing file data...")

    def proccess_file(self, df, nombre_archivo):
        print("Proccessing file data...")
        resultados = {
            'genes_procesados': 0,
            'caracteristicas_guardadas': 0,
            'errores': []
        }
        
        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    gene_nombre = str(row['Gene']).strip()
                    if not gene_nombre:
                        continue

                    # Crear o obtener el gen
                    gen, created = Gene.objects.get_or_create(
                        nombre=gene_nombre
                    )
                    
                    if created:
                        print(f"{gene_nombre}")
                        resultados['genes_procesados'] += 1

                    # Crear la característica
                    caracteristica = CaracteristicaGen(
                        gen=gen,
                        archivo_origen=nombre_archivo,
                        gene=gene_nombre,
                        cord=str(row['Cord']).strip() if pd.notna(row['Cord']) else '',
                        valor=str(row['Valor']).strip() if pd.notna(row['Valor']) else '',
                        color=str(row['Color']).strip() if pd.notna(row['Color']) else '',
                        protein=str(row['Protein']).strip() if pd.notna(row['Protein']) else '',
                        alleleasoc=str(row['Alleleasoc']).strip() if pd.notna(row['Alleleasoc']) else '',
                        species=str(row['Species']).strip() if pd.notna(row['Species']) else '',
                        variant=str(row['Variant']).strip() if pd.notna(row['Variant']) else ''
                    )
                    print(f"Save.....{index}")                    
                    caracteristica.save()
                    resultados['caracteristicas_guardadas'] += 1
                    
                except Exception as e:
                    resultados['errores'].append({
                        'fila': index + 2,  # +2 porque Excel empieza en 1 y tiene encabezado
                        'error': str(e)
                    })
        
        return resultados
           
