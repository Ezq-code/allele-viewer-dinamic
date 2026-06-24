import logging
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.caracteristica_gen import CaracteristicaGen

logger = logging.getLogger(__name__)


class XslxReader:
    """Lector optimizado de archivos Excel usando Bulk Operations"""

    def __init__(self, origin_file=None):  # ← Parámetro opcional con valor por defecto
        self.origin_file = origin_file  # ← Ahora sí está definido
        self.batch_size = 5000  # Ajustable según rendimiento

    def proccess_file(self, df, nombre_archivo):
        """
        Procesa archivo Excel usando operaciones masivas.

        Args:
            df: DataFrame de pandas
            nombre_archivo: Nombre del archivo origen

        Returns:
            dict: Resultados del procesamiento
        """
        logger.info(f"Iniciando procesamiento optimizado de {nombre_archivo}")
        logger.info(f"Total de filas a procesar: {len(df)}")

        resultados = {
            "genes_procesados": 0,
            "caracteristicas_creadas": 0,
            "caracteristicas_actualizadas": 0,
            "caracteristicas_omitidas": 0,
            "errores": [],
            "total_filas": len(df),
        }

        # Validar columna obligatoria
        if "Gene" not in df.columns:
            resultados["errores"].append(
                {"error_general": "La columna 'Gene' es obligatoria"}
            )
            return resultados

        # Preparar datos
        df = self._preparar_dataframe(df)

        if df.empty:
            resultados["errores"].append(
                {"error_general": "No hay datos válidos para procesar"}
            )
            return resultados

        try:
            with transaction.atomic():
                # Procesar genes
                genes_dict = self._procesar_genes_bulk(df, resultados)

                # Procesar características
                self._procesar_caracteristicas_bulk(
                    df, genes_dict, nombre_archivo, resultados
                )

        except Exception as e:
            logger.error(f"Error crítico: {e}", exc_info=True)
            resultados["errores"].append(
                {"error_general": f"Error en transacción: {str(e)}"}
            )

        logger.info(
            f"✅ Procesamiento completado. "
            f"Genes nuevos: {resultados['genes_procesados']}, "
            f"Creadas: {resultados['caracteristicas_creadas']}, "
            f"Actualizadas: {resultados['caracteristicas_actualizadas']}, "
            f"Errores: {len(resultados['errores'])}"
        )

        return resultados

    def _preparar_dataframe(self, df):
        """Prepara y limpia el DataFrame"""
        df = df.copy()

        # Limpiar nombres de columnas
        df.columns = df.columns.str.strip()

        # Filtrar filas sin Gene
        df = df[df["Gene"].notna() & (df["Gene"].astype(str).str.strip() != "")]

        if df.empty:
            return df

        # Limpiar datos de texto
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace("nan", "")

        # Manejar Cord (puede ser vacío)
        df["Cord"] = df["Cord"].fillna("").astype(str).str.strip()

        logger.info(f"DataFrame preparado: {len(df)} filas para procesar")
        return df

    def _procesar_genes_bulk(self, df, resultados):
        """Procesa genes usando bulk_create optimizado"""
        genes_nombres = df["Gene"].unique()
        logger.info(f"Procesando {len(genes_nombres)} genes únicos...")

        # Obtener genes existentes (una consulta)
        genes_existentes = {
            gene.name: gene for gene in Gene.objects.filter(name__in=genes_nombres)
        }

        # Identificar genes nuevos
        genes_nuevos = []
        for gene_nombre in genes_nombres:
            if gene_nombre not in genes_existentes:
                genes_nuevos.append(Gene(name=gene_nombre))
                resultados["genes_procesados"] += 1

        # Crear genes nuevos en bulk
        if genes_nuevos:
            logger.info(f"Creando {len(genes_nuevos)} genes nuevos...")
            Gene.objects.bulk_create(genes_nuevos, batch_size=self.batch_size)

            # Recargar incluyendo los nuevos
            genes_existentes.update(
                {
                    gene.name: gene
                    for gene in Gene.objects.filter(name__in=genes_nombres)
                }
            )

        return genes_existentes

    def _procesar_caracteristicas_bulk(
        self, df, genes_dict, nombre_archivo, resultados
    ):
        """Procesa características usando bulk_create y bulk_update"""
        logger.info("Preparando características para procesamiento bulk...")

        # Mapear genes a IDs
        df["gen_id"] = df["Gene"].map(
            lambda x: genes_dict[x].id if x in genes_dict else None
        )
        df_valid = df[df["gen_id"].notna()].copy()

        if df_valid.empty:
            logger.warning("No hay características válidas para procesar")
            return

        # Obtener características existentes en UNA consulta
        gen_ids = df_valid["gen_id"].unique()

        caracteristicas_existentes = {
            (c.gen_id, c.cord): c
            for c in CaracteristicaGen.objects.filter(
                gen_id__in=gen_ids
            ).select_related("gen")
        }

        logger.info(
            f"Encontradas {len(caracteristicas_existentes)} características existentes"
        )

        # Preparar listas para bulk operations
        caracteristicas_crear = []
        caracteristicas_actualizar = []
        campos_actualizar = [
            "archivo_origen",
            "gene",
            "valor",
            "color",
            "protein",
            "alleleasoc",
            "species",
            "variant",
            "order_one",
            "order_two",
            "order_three",
            "ncbi_link",
        ]

        # Procesar cada fila
        for index, row in df_valid.iterrows():
            try:
                gen = genes_dict[row["Gene"]]
                cord_valor = row["Cord"]

                # Construir valores
                valores = {
                    "archivo_origen": nombre_archivo,
                    "gene": str(row["Gene"]),
                    "valor": str(row.get("Valor", "")),
                    "color": str(row.get("Color", "")),
                    "protein": str(row.get("Protein", "")),
                    "alleleasoc": str(row.get("Alleleasoc", "")),
                    "species": str(row.get("Species", "")),
                    "variant": str(row.get("Variant", "")),
                    "order_one": str(row.get("Order1", "")),
                    "order_two": str(row.get("Order2", "")),
                    "order_three": str(row.get("Order3", "")),
                    "ncbi_link": str(row.get("NCBI_Link", "")),
                }

                # Limpiar valores 'nan' y 'None'
                for key, value in valores.items():
                    if value in ["nan", "None", ""]:
                        valores[key] = ""

                key = (gen.id, cord_valor)

                if key in caracteristicas_existentes:
                    # Actualizar existente
                    caracteristica = caracteristicas_existentes[key]
                    necesita_actualizar = False

                    for campo in campos_actualizar:
                        nuevo_valor = valores.get(campo, "")
                        if getattr(caracteristica, campo) != nuevo_valor:
                            setattr(caracteristica, campo, nuevo_valor)
                            necesita_actualizar = True

                    if necesita_actualizar:
                        caracteristicas_actualizar.append(caracteristica)
                        resultados["caracteristicas_actualizadas"] += 1
                    else:
                        resultados["caracteristicas_omitidas"] += 1

                else:
                    # Crear nueva
                    caracteristicas_crear.append(
                        CaracteristicaGen(gen=gen, cord=cord_valor, **valores)
                    )
                    resultados["caracteristicas_creadas"] += 1

            except Exception as e:
                resultados["errores"].append(
                    {
                        "fila": index + 2,
                        "error": f"Error en fila: {str(e)}",
                        "gene": row.get("Gene", "N/A"),
                        "cord": row.get("Cord", "N/A"),
                    }
                )

        # Ejecutar bulk operations
        if caracteristicas_crear:
            logger.info(f"Creando {len(caracteristicas_crear)} características...")
            CaracteristicaGen.objects.bulk_create(
                caracteristicas_crear,
                batch_size=self.batch_size,
                ignore_conflicts=False,
            )

        if caracteristicas_actualizar:
            logger.info(
                f"Actualizando {len(caracteristicas_actualizar)} características..."
            )
            CaracteristicaGen.objects.bulk_update(
                caracteristicas_actualizar,
                campos_actualizar,
                batch_size=self.batch_size,
            )

        logger.info(
            f"✅ Características procesadas: "
            f"{resultados['caracteristicas_creadas']} creadas, "
            f"{resultados['caracteristicas_actualizadas']} actualizadas, "
            f"{resultados['caracteristicas_omitidas']} sin cambios"
        )


# Clase para compatibilidad con código existente (si es necesario)
class XslxReaderLegacy:
    """Mantiene compatibilidad con el método estático original"""

    @staticmethod
    def proccess_file(df, nombre_archivo):
        reader = XslxReader()
        return reader.proccess_file(df, nombre_archivo)
