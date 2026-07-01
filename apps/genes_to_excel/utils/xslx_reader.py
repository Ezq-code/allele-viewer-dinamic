import logging
import pandas as pd
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.caracteristica_gen import CaracteristicaGen
from .excel_nomenclators import ExcelNomenclators

logger = logging.getLogger(__name__)


class XslxReader:
    """Optimized Excel reader using bulk database operations."""

    required_columns = [
        ExcelNomenclators.gene_column_name,
        ExcelNomenclators.coord_column_name,
        ExcelNomenclators.valor_column_name,
        ExcelNomenclators.color_column_name,
        ExcelNomenclators.protein_column_name,
        ExcelNomenclators.alleleasoc_column_name,
        ExcelNomenclators.species_column_name,
        ExcelNomenclators.variant_column_name,
        "Order1",
        "Order2",
        "Order3",
        "NCBI_Link",
    ]

    def __init__(self, origin_file=None):
        self.origin_file = origin_file
        self.batch_size = 5000
        self.df = None

        if origin_file is not None:
            self.df = self._load_dataframe(origin_file)
            self._validate_required_columns(self.df)

    def _load_dataframe(self, origin_file):
        """Load and concatenate all sheets from the Excel file."""
        excel_file = pd.ExcelFile(origin_file)
        all_dfs = [pd.read_excel(excel_file, sheet_name=sheet_name) for sheet_name in excel_file.sheet_names]

        if not all_dfs:
            return pd.DataFrame()

        return pd.concat(all_dfs, ignore_index=True)

    def _validate_required_columns(self, df):
        """Validate that the file includes all required processing columns."""
        missing_columns = [column for column in self.required_columns if column not in df.columns]

        if missing_columns:
            raise ValueError(
                f"The file must contains the needed columns: {', '.join(missing_columns)}"
            )

    def proccess_file(self, df, nombre_archivo):
        """
        Process an Excel dataset using bulk operations.

        Args:
            df: pandas DataFrame
            nombre_archivo: Source file name

        Returns:
            dict: Processing summary
        """
        logger.info(f"Iniciando procesamiento optimizado de {nombre_archivo}")
        logger.info(f"Total de filas a procesar: {len(df)}")

        results = {
            "genes_procesados": 0,
            "caracteristicas_creadas": 0,
            "caracteristicas_actualizadas": 0,
            "caracteristicas_omitidas": 0,
            "errores": [],
            "total_filas": len(df)
        }

        # Prepare input data.
        df = self._preparar_dataframe(df)

        if df.empty:
            results["errores"].append({
                "error_general": "No hay datos válidos para procesar"
            })
            return results

        try:
            with transaction.atomic():
                # Process genes.
                genes_by_name = self._procesar_genes_bulk(df, results)

                # Process gene features.
                self._procesar_caracteristicas_bulk(df, genes_by_name, nombre_archivo, results)

        except Exception as e:
            logger.error(f"Error crítico: {e}", exc_info=True)
            results["errores"].append({
                "error_general": f"Error en transacción: {str(e)}"
            })
 
        logger.info(f"✅ Procesamiento completado. "
                   f"Genes nuevos: {results['genes_procesados']}, "
                   f"Creadas: {results['caracteristicas_creadas']}, "
                   f"Actualizadas: {results['caracteristicas_actualizadas']}, "
                   f"Errores: {len(results['errores'])}")

        return results

    def _preparar_dataframe(self, df):
        """Prepare and clean the input DataFrame."""
        df = df.copy()

        # Normalize column names.
        df.columns = df.columns.str.strip()

        # Remove rows without Gene.
        df = df[df["Gene"].notna() & (df["Gene"].astype(str).str.strip() != "")]

        if df.empty:
            return df

        self._validate_required_columns(df)

        # Normalize text-like columns.
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace('nan', '')

        # Cord can be empty.
        df["Cord"] = df["Cord"].fillna('').astype(str).str.strip()

        logger.info(f"DataFrame preparado: {len(df)} filas para procesar")
        return df

    def _procesar_genes_bulk(self, df, resultados):
        """Process genes using optimized bulk_create."""
        gene_names = df["Gene"].unique()
        logger.info(f"Procesando {len(gene_names)} genes únicos...")

        # Fetch existing genes in a single query.
        existing_genes = {
            gene.name: gene 
            for gene in Gene.objects.filter(name__in=gene_names)
        }

        # Find new genes to create.
        new_genes = []
        for gene_name in gene_names:
            if gene_name not in existing_genes:
                new_genes.append(Gene(name=gene_name))
                resultados["genes_procesados"] += 1

        # Bulk-create missing genes.
        if new_genes:
            logger.info(f"Creando {len(new_genes)} genes nuevos...")
            Gene.objects.bulk_create(new_genes, batch_size=self.batch_size)

            # Reload the full mapping including newly created genes.
            existing_genes.update({
                gene.name: gene 
                for gene in Gene.objects.filter(name__in=gene_names)
            })

        return existing_genes

    def _procesar_caracteristicas_bulk(self, df, genes_dict, nombre_archivo, resultados):
        """Process gene features using bulk_create and bulk_update."""
        logger.info("Preparando características para procesamiento bulk...")

        # Map gene names to IDs.
        df["gen_id"] = df["Gene"].map(lambda x: genes_dict[x].id if x in genes_dict else None)
        valid_df = df[df["gen_id"].notna()].copy()

        if valid_df.empty:
            logger.warning("No hay características válidas para procesar")
            return

        # Fetch existing features in a single query.
        gene_ids = valid_df["gen_id"].unique()

        existing_features = {
            (c.gen_id, c.cord): c 
            for c in CaracteristicaGen.objects.filter(
                gen_id__in=gene_ids
            ).select_related('gen')
        }

        logger.info(f"Encontradas {len(existing_features)} características existentes")

        # Prepare bulk operation containers.
        features_to_create = []
        features_to_update = []
        fields_to_update = [
            'archivo_origen', 'gene', 'valor', 'color', 'protein',
            'alleleasoc', 'species', 'variant', 'order_one', 
            'order_two', 'order_three', 'ncbi_link'
        ]

        # Process each row.
        for index, row in valid_df.iterrows():
            try:
                gen = genes_dict[row["Gene"]]
                cord_value = row["Cord"]

                # Build normalized values.
                field_values = {
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

                # Normalize empty-like values.
                for key, value in field_values.items():
                    if value in ['nan', 'None', '']:
                        field_values[key] = ''

                feature_key = (gen.id, cord_value)

                if feature_key in existing_features:
                    # Update an existing feature when needed.
                    feature = existing_features[feature_key]
                    needs_update = False

                    for field in fields_to_update:
                        new_value = field_values.get(field, '')
                        if getattr(feature, field) != new_value:
                            setattr(feature, field, new_value)
                            needs_update = True

                    if needs_update:
                        features_to_update.append(feature)
                        resultados["caracteristicas_actualizadas"] += 1
                    else:
                        resultados["caracteristicas_omitidas"] += 1

                else:
                    # Create a new feature.
                    features_to_create.append(
                        CaracteristicaGen(gen=gen, cord=cord_value, **field_values)
                    )
                    resultados["caracteristicas_creadas"] += 1

            except Exception as e:
                resultados["errores"].append({
                    "fila": index + 2,
                    "error": f"Error en fila: {str(e)}",
                    "gene": row.get("Gene", "N/A"),
                    "cord": row.get("Cord", "N/A")
                })

        # Execute bulk operations.
        if features_to_create:
            logger.info(f"Creando {len(features_to_create)} características...")
            CaracteristicaGen.objects.bulk_create(
                features_to_create,
                batch_size=self.batch_size,
                ignore_conflicts=False
            )

        if features_to_update:
            logger.info(f"Actualizando {len(features_to_update)} características...")
            CaracteristicaGen.objects.bulk_update(
                features_to_update,
                fields_to_update,
                batch_size=self.batch_size
            )

        logger.info(f"✅ Características procesadas: "
                   f"{resultados['caracteristicas_creadas']} creadas, "
                   f"{resultados['caracteristicas_actualizadas']} actualizadas, "
                   f"{resultados['caracteristicas_omitidas']} sin cambios")


# Compatibility class for legacy static-call usage.
class XslxReaderLegacy:
    """Keeps compatibility with the original static-style API."""
    
    @staticmethod
    def proccess_file(df, nombre_archivo):
        reader = XslxReader()
        return reader.proccess_file(df, nombre_archivo)