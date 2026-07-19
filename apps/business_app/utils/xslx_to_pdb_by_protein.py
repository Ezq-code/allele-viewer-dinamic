import logging


from apps.business_app.utils.xslx_to_pdb import XslxToPdb
from .excel_nomenclators_base import ExcelNomenclatorsBase


logger = logging.getLogger(__name__)


class XslxToPdbByProtein(XslxToPdb):
    def __init__(
        self,
        origin_file,
        global_configuration,
        excel_nomenclator_class: ExcelNomenclatorsBase,
    ) -> None:
        super().__init__(
            origin_file,
            global_configuration,
            excel_nomenclator_class=excel_nomenclator_class,
        )

    def _node_factory(
        self,
        element,
        row_number,
        allele,
        rs,
        region,
        age_1,
        age_2,
        frec_afr_amr,
        frec_amr,
        frec_csa,
        frec_eas,
        frec_eur,
        frec_lat,
        frec_nea,
        frec_oce,
        frec_ssa,
        frec_afr_eas,
        frec_afr_swe,
        frec_afr_nor,
        frec_ca,
        frec_sa,
        loss,
        increment,
    ):
        empty_allele = ""
        created_node = super()._node_factory(
            element=element,
            row_number=row_number,
            allele=allele if len(allele) > 1 else empty_allele,
            rs=rs,
            region=region,
            age_1=age_1,
            age_2=age_2,
            frec_afr_amr=frec_afr_amr,
            frec_amr=frec_amr,
            frec_csa=frec_csa,
            frec_eas=frec_eas,
            frec_eur=frec_eur,
            frec_lat=frec_lat,
            frec_nea=frec_nea,
            frec_oce=frec_oce,
            frec_ssa=frec_ssa,
            frec_afr_eas=frec_afr_eas,
            frec_afr_swe=frec_afr_swe,
            frec_afr_nor=frec_afr_nor,
            frec_ca=frec_ca,
            frec_sa=frec_sa,
            loss=loss,
            increment=increment,
        )

        if len(allele) > 1:
            self.model.objects.filter(study=self.study, allele=empty_allele).update(
                allele=allele
            )
            created_node.is_final_for_allele = True
            created_node.save(update_fields=["is_final_for_allele"])
        return created_node
