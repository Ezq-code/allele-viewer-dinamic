import logging
import pandas as pd

from django.db import IntegrityError, transaction

from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.utils.excel_snp_nomenclators import ExcelSNPNomenclators

logger = logging.getLogger(__name__)


class ExcelSNPReader:
    def __init__(self, origin_file) -> None:
        self.origin_file = origin_file

        self._output_mandatory_columns_for_sheet_allele_validation = (
            ExcelSNPNomenclators.sheet_allele_column_allele,
            ExcelSNPNomenclators.sheet_allele_column_parent,
            ExcelSNPNomenclators.sheet_allele_column_increment_ancesters_snp,
            ExcelSNPNomenclators.sheet_allele_column_increment_location_snp,
            ExcelSNPNomenclators.sheet_allele_column_loss_ancesters_snp,
            ExcelSNPNomenclators.sheet_allele_column_loss_location_snp,
        )

        self.sheet_allele_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelSNPNomenclators.sheet_allele,
            engine="openpyxl",
        )

        self._validate_sheet_structure(
            self.sheet_allele_df,
            self._output_mandatory_columns_for_sheet_allele_validation,
            ExcelSNPNomenclators.sheet_allele,
        )
        self._output_mandatory_columns_for_sheet_bd_location_validation = (
            self._output_mandatory_columns_for_sheet_bd_ancesters_validation
        ) = (
            ExcelSNPNomenclators.sheet_bd_column_allele,
            ExcelSNPNomenclators.sheet_bd_column_color,
            ExcelSNPNomenclators.sheet_bd_column_formation,
            ExcelSNPNomenclators.sheet_bd_column_order,
        )

        self.sheet_bd_location_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelSNPNomenclators.sheet_bd_location,
            engine="openpyxl",
        )

        self._validate_sheet_structure(
            self.sheet_bd_location_df,
            self._output_mandatory_columns_for_sheet_bd_location_validation,
            ExcelSNPNomenclators.sheet_bd_location,
        )

        self.sheet_bd_ancesters_df = pd.read_excel(
            self.origin_file,
            sheet_name=ExcelSNPNomenclators.sheet_bd_ancesters,
            engine="openpyxl",
        )

        self._validate_sheet_structure(
            self.sheet_bd_ancesters_df,
            self._output_mandatory_columns_for_sheet_bd_ancesters_validation,
            ExcelSNPNomenclators.sheet_bd_ancesters,
        )

    def _validate_sheet_structure(self, sheet_dataframe, mandatory_columns, sheet):
        first_row_output = sheet_dataframe.iloc[0]
        for column in mandatory_columns:
            try:
                first_row_output[column]
            except KeyError as e:
                logger.error(f"{str(e)}")
                raise ValueError(
                    f"Invalid file structure, the table on the sheet '{sheet}' "
                    f"has at least the next column missing: {column}."
                ) from None

    def proccess_sheet_allele(self, file_id):
        print("Proccessing sheet_allele file data...")
        data = []
        for index, row in self.sheet_allele_df.iterrows():
            allele = row[ExcelSNPNomenclators.sheet_allele_column_allele]
            if pd.isna(allele):
                break
            parents_info = row[ExcelSNPNomenclators.sheet_allele_column_parent]
            loss_ancesters_snp = row[
                ExcelSNPNomenclators.sheet_allele_column_loss_ancesters_snp
            ]
            increment_ancesters_snp = row[
                ExcelSNPNomenclators.sheet_allele_column_increment_ancesters_snp
            ]
            loss_location_snp = row[
                ExcelSNPNomenclators.sheet_allele_column_loss_location_snp
            ]
            increment_location_snp = row[
                ExcelSNPNomenclators.sheet_allele_column_increment_location_snp
            ]
            data.append(
                AlleleSNPInfo(
                    allele=allele,
                    parents_info=parents_info if not pd.isna(parents_info) else None,
                    loss_ancesters_snp=loss_ancesters_snp
                    if not pd.isna(loss_ancesters_snp)
                    else None,
                    increment_ancesters_snp=increment_ancesters_snp
                    if not pd.isna(increment_ancesters_snp)
                    else None,
                    loss_location_snp=loss_location_snp
                    if not pd.isna(loss_location_snp)
                    else None,
                    increment_location_snp=increment_location_snp
                    if not pd.isna(increment_location_snp)
                    else None,
                    uploaded_file_id=file_id,
                )
            )
        try:
            with transaction.atomic():
                if not data:
                    logger.error("No data to proccess")
                    raise Exception(
                        "Check the excel file, remove any blank line at the first rows"
                    )
                AlleleSNPInfo.objects.bulk_create(data)
        except IntegrityError as e:
            logger.error(f"Integrity error while creating AlleleSNPInfo: {e}")
            raise ValueError(
                "Integrity error while processing allele data. "
                "Please check for duplicate entries."
            )
        except Exception as e:
            logger.error(f"Unexpected error processing allele data: {e}")
            raise ValueError(
                "An unexpected error occurred while processing allele data. "
                "Please check the file format and try again."
            )
