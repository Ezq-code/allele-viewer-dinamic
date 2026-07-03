import logging
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.caracteristica_gen import CaracteristicaGen
from .excel_nomenclators import ExcelNomenclators
from .excel_structure_validator import ExcelStructureValidator


logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    """Optimized Excel reader using bulk database operations."""

    def __init__(self, origin_file=None):
        self.batch_size = 5000
        super().__init__(origin_file=origin_file)

    def proccess_file(self, file_name, uploaded_file_id):
        """
        Process an Excel dataset using bulk operations.

        Args:
            df: pandas DataFrame
            nombre_archivo: Source file name

        Returns:
            dict: Processing summary
        """
        logger.info(f"Starting optimized processing for {file_name}")
        logger.info(f"Total rows to process: {len(self.df)}")

        results = {
            "processed_genes": 0,
            "created_features": 0,
            "updated_features": 0,
            "skipped_features": 0,
            "errors": [],
            "total_rows": len(self.df),
        }

        # Prepare input data.
        df = self._prepare_dataframe()

        if df.empty:
            results["errors"].append(
                {"general_error": "There is no valid data to process"}
            )
            return results

        try:
            with transaction.atomic():
                # Process genes.
                genes_by_name = self._procesar_genes_bulk(df, results)

                # Process gene features.
                self._procesar_caracteristicas_bulk(
                    df, genes_by_name, file_name, results, uploaded_file_id
                )

        except Exception as e:
            logger.error(f"Critical error: {e}", exc_info=True)
            results["errors"].append({"general_error": f"Transaction error: {str(e)}"})

        logger.info(
            f"✅ Processing completed. "
            f"New genes: {results['processed_genes']}, "
            f"Created: {results['created_features']}, "
            f"Updated: {results['updated_features']}, "
            f"Errors: {len(results['errors'])}"
        )

        return results

    def _prepare_dataframe(self):
        """Prepare and clean the input DataFrame."""
        df = self.df.copy()

        # Normalize column names.
        df.columns = df.columns.str.strip()

        # Remove rows without Gene.
        df = df[df["Gene"].notna() & (df["Gene"].astype(str).str.strip() != "")]

        if df.empty:
            return df

        # Normalize text-like columns.
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace("nan", "")

        # Cord can be empty.
        df["Cord"] = df["Cord"].fillna("").astype(str).str.strip()

        logger.info(f"DataFrame prepared: {len(df)} rows ready for processing")
        return df

    def _procesar_genes_bulk(self, df, resultados):
        """Process genes using optimized bulk_create."""
        gene_names = df["Gene"].unique()
        logger.info(f"Processing {len(gene_names)} unique genes...")

        # Fetch existing genes in a single query.
        existing_genes = {
            gene.name: gene for gene in Gene.objects.filter(name__in=gene_names)
        }

        # Find new genes to create.
        new_genes = []
        for gene_name in gene_names:
            if gene_name not in existing_genes:
                new_genes.append(Gene(name=gene_name))
                resultados["processed_genes"] += 1

        # Bulk-create missing genes.
        if new_genes:
            logger.info(f"Creating {len(new_genes)} new genes...")
            Gene.objects.bulk_create(
                new_genes, batch_size=self.batch_size, ignore_conflicts=True
            )

            # Reload the full mapping including newly created genes.
            existing_genes.update(
                {gene.name: gene for gene in Gene.objects.filter(name__in=gene_names)}
            )

        return existing_genes

    def _procesar_caracteristicas_bulk(
        self, df, genes_dict, nombre_archivo, resultados, uploaded_file_id
    ):
        """Process gene features using bulk_create and bulk_update."""
        logger.info("Preparing features for bulk processing...")

        # Map gene names to IDs.
        df["gen_id"] = df["Gene"].map(
            lambda x: genes_dict[x].id if x in genes_dict else None
        )
        valid_df = df[df["gen_id"].notna()].copy()

        if valid_df.empty:
            logger.warning("There are no valid features to process")
            return

        # Fetch existing features in a single query.
        gene_ids = valid_df["gen_id"].unique()

        existing_features = {
            (c.gen_id, c.cord): c
            for c in CaracteristicaGen.objects.filter(
                gen_id__in=gene_ids
            ).select_related("gen")
        }

        logger.info(f"Found {len(existing_features)} existing features")

        # Prepare bulk operation containers.
        features_to_create = []
        features_to_update = []
        fields_to_update = (
            None  # This value will be set when defined the field_values below.
        )

        # Process each row.
        for index, row in valid_df.iterrows():
            try:
                gen = genes_dict[row[ExcelNomenclators.gene_column_name]]
                cord_value = row[ExcelNomenclators.coord_column_name]

                # Build normalized values.
                field_values = {
                    "archivo_origen": nombre_archivo,
                    "gene": str(row[ExcelNomenclators.gene_column_name]),
                    "valor": str(row.get(ExcelNomenclators.valor_column_name, "")),
                    "color": str(row.get(ExcelNomenclators.color_column_name, "")),
                    "protein": str(row.get(ExcelNomenclators.protein_column_name, "")),
                    "alleleasoc": str(
                        row.get(ExcelNomenclators.alleleasoc_column_name, "")
                    ),
                    "species": str(row.get(ExcelNomenclators.species_column_name, "")),
                    "variant": str(row.get(ExcelNomenclators.variant_column_name, "")),
                    "order_one": str(
                        row.get(ExcelNomenclators.order_1_column_name, "")
                    ),
                    "order_two": str(
                        row.get(ExcelNomenclators.order_2_column_name, "")
                    ),
                    "order_three": str(
                        row.get(ExcelNomenclators.order_3_column_name, "")
                    ),
                    "ncbi_link": str(
                        row.get(ExcelNomenclators.ncbi_link_column_name, "")
                    ),
                }
                fields_to_update = field_values.keys()

                # Normalize empty-like values.
                default_string_lenght_for_slicing = 50
                for key, value in field_values.items():
                    if value in ["nan", "None", ""]:
                        field_values[key] = ""
                    if len(value) > 50:
                        field_values[key] = value[
                            : getattr(
                                CaracteristicaGen._meta.get_field(key),
                                "max_length",
                                default_string_lenght_for_slicing,
                            )
                        ]

                feature_key = (gen.id, cord_value)

                if feature_key in existing_features:
                    # Update an existing feature when needed.
                    feature = existing_features[feature_key]
                    needs_update = False

                    for field in fields_to_update:
                        new_value = field_values.get(field, "")
                        if getattr(feature, field) != new_value:
                            setattr(feature, field, new_value)
                            needs_update = True

                    if needs_update:
                        features_to_update.append(feature)
                        resultados["updated_features"] += 1
                    else:
                        resultados["skipped_features"] += 1

                else:
                    # Create a new feature.
                    features_to_create.append(
                        CaracteristicaGen(
                            gen=gen,
                            cord=cord_value,
                            uploaded_excel_file_id=uploaded_file_id,
                            **field_values,
                        )
                    )
                    resultados["created_features"] += 1

            except Exception as e:
                resultados["errors"].append(
                    {
                        "row": index + 2,
                        "error": f"Row processing error: {str(e)}",
                        "gene": row.get("Gene", "N/A"),
                        "cord": row.get("Cord", "N/A"),
                    }
                )

        # Execute bulk operations.
        if features_to_create:
            logger.info(f"Creating {len(features_to_create)} features...")
            CaracteristicaGen.objects.bulk_create(
                features_to_create, batch_size=self.batch_size
            )

        if features_to_update:
            logger.info(f"Updating {len(features_to_update)} features...")
            CaracteristicaGen.objects.bulk_update(
                features_to_update, fields_to_update, batch_size=self.batch_size
            )

        logger.info(
            f"✅ Features processed: "
            f"{resultados['created_features']} created, "
            f"{resultados['updated_features']} updated, "
            f"{resultados['skipped_features']} unchanged"
        )


# Compatibility class for legacy static-call usage.
class XslxReaderLegacy:
    """Keeps compatibility with the original static-style API."""

    @staticmethod
    def proccess_file(df, nombre_archivo):
        reader = XslxReader()
        return reader.proccess_file(df, nombre_archivo)
