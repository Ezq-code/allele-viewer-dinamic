import logging

logger = logging.getLogger(__name__)


class ExcelNomenclators:
    gene_column_name = "Gene"
    coord_column_name = "Cord"
    valor_column_name = "Valor"
    color_column_name = "Color"
    protein_column_name = "Protein"
    alleleasoc_column_name = "Alleleasoc"
    species_column_name = "Species"
    variant_column_name = "Variant"

    input_sheet = "HLA-A"
