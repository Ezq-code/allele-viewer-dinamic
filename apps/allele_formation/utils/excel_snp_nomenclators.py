import logging

logger = logging.getLogger(__name__)


class ExcelSNPNomenclators:
    sheet_allele_column_parent = "Parent"
    sheet_allele_column_allele = "Allele"
    sheet_allele_column_loss_ancesters_snp = "Lost_ASNPs"
    sheet_allele_column_increment_ancesters_snp = "Increment_ASNPs"
    sheet_allele_column_loss_location_snp = "Lost_LSNPs"
    sheet_allele_column_increment_location_snp = "Increment_LSNPs"

    sheet_bd_column_allele = "Allele"
    sheet_bd_column_order = "Order"
    sheet_bd_column_formation = "Formation"
    sheet_bd_column_color = "ColorHEX"

    sheet_allele = "Allele"
    sheet_bd_location = "BDL"
    sheet_bd_ancesters = "BDA"
