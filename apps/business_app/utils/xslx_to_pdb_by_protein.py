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

    # def proccess_pdb_file(self, uploaded_file_id, pdb_filename_base):
    #     logger.info("Proccessing PDB file...")
    #     node_number_pool = []
    #     try:
    #         pdb_files = [io.StringIO() for _ in range(self.coordinates_sets)]
    #         # Open the PDB file for writing
    #         nodes = {}

    #         # atom_number = 0
    #         relations_for_the_end = {}
    #         element = None
    #         # Loop over each row in the Excel file
    #         for _, row in self.output_df.iterrows():
    #             allele = row[self.excel_nomenclator_class.output_allele_column_name]
    #             # if self.ilu_search_criteria in allele:
    #             #     continue
    #             # age = row.get(self.excel_nomenclator_class.age)
    #             age_1 = row.get(self.excel_nomenclator_class.age_1)
    #             age_2 = row.get(self.excel_nomenclator_class.age_2)
    #             loss = row.get(self.excel_nomenclator_class.loss)
    #             increment = row.get(self.excel_nomenclator_class.increment)

    #             frec_afr_amr = row.get(self.excel_nomenclator_class.frec_afr_amr)
    #             frec_amr = row.get(self.excel_nomenclator_class.frec_amr)
    #             frec_csa = row.get(self.excel_nomenclator_class.frec_csa)
    #             frec_eas = row.get(self.excel_nomenclator_class.frec_eas)
    #             frec_eur = row.get(self.excel_nomenclator_class.frec_eur)
    #             frec_lat = row.get(self.excel_nomenclator_class.frec_lat)
    #             frec_nea = row.get(self.excel_nomenclator_class.frec_nea)
    #             frec_oce = row.get(self.excel_nomenclator_class.frec_oce)
    #             frec_ssa = row.get(self.excel_nomenclator_class.frec_ssa)
    #             frec_afr_eas = row.get(self.excel_nomenclator_class.frec_afr_eas)
    #             frec_afr_swe = row.get(self.excel_nomenclator_class.frec_afr_swe)
    #             frec_afr_nor = row.get(self.excel_nomenclator_class.frec_afr_nor)
    #             frec_ca = row.get(self.excel_nomenclator_class.frec_ca)
    #             frec_sa = row.get(self.excel_nomenclator_class.frec_sa)

    #             if pd.isna(allele) or pd.isna(
    #                 row[self.excel_nomenclator_class.output_number_column_name]
    #             ):
    #                 break
    #             row_number = int(
    #                 row[self.excel_nomenclator_class.output_number_column_name]
    #             )
    #             if row_number in node_number_pool:
    #                 continue
    #             node_number_pool.append(row_number)
    #             rs = row[self.excel_nomenclator_class.output_rs_column_name]
    #             parents_info = row[
    #                 self.excel_nomenclator_class.output_parent_column_name
    #             ]

    #             parents = []
    #             if not pd.isna(parents_info):
    #                 parents = (
    #                     int(parent.strip()) for parent in parents_info.split(",")
    #                 )
    #             for parent in parents:
    #                 if parent == row_number:
    #                     continue
    #                 relations_for_the_end.setdefault(parent, []).append(row_number)
    #             # element = next(self.elements_symbol_iterator)
    #             region = row.get(
    #                 self.excel_nomenclator_class.output_region_column_name
    #             )
    #             if isinstance(region, str):
    #                 region = region.upper()
    #             element = self.region_color_maping.get(
    #                 region, self.default_value_if_no_region
    #             )

    #             # Write the atom record in the PDB file format
    #             current_coordinate_index = 0

    #             for memory_file in pdb_files:
    #                 x_value = row[f"X{current_coordinate_index}"]
    #                 y_value = row[f"Y{current_coordinate_index}"]
    #                 z_value = row[f"Z{current_coordinate_index}"]
    #                 if pd.isna(x_value) or pd.isna(y_value) or pd.isna(z_value):
    #                     raise ValueError(
    #                         f"Faltan elementos relacionados con las coordenadas. Revisar el alelo {row_number}"
    #                     )
    #                 memory_file.write(
    #                     self.excel_nomenclator_class.get_atom_record_string(
    #                         row_number=row_number,
    #                         element=element,
    #                         x_coordinate=int(x_value),
    #                         y_coordinate=int(y_value),
    #                         z_coordinate=int(z_value),
    #                     )
    #                 )
    #                 memory_file.write("\n")
    #                 current_coordinate_index += 1

    #             nodes[row_number] = self.model.objects.create(
    #                 element=element,
    #                 number=row_number,
    #                 allele=allele,
    #                 rs=rs,
    #                 study=self.study,
    #                 region=region,
    #                 #! Age is no longer coming in the excel file, for timeline we will use temporarily age_1
    #                 # timeline_appearence=None if pd.isna(age) else age,
    #                 timeline_appearence=None if pd.isna(age_1) else age_1,
    #                 age_1=None if pd.isna(age_1) else age_1,
    #                 age_2=None if pd.isna(age_2) else age_2,
    #                 frec_afr_amr=None if pd.isna(frec_afr_amr) else frec_afr_amr,
    #                 frec_amr=None if pd.isna(frec_amr) else frec_amr,
    #                 frec_csa=None if pd.isna(frec_csa) else frec_csa,
    #                 frec_eas=None if pd.isna(frec_eas) else frec_eas,
    #                 frec_eur=None if pd.isna(frec_eur) else frec_eur,
    #                 frec_lat=None if pd.isna(frec_lat) else frec_lat,
    #                 frec_nea=None if pd.isna(frec_nea) else frec_nea,
    #                 frec_oce=None if pd.isna(frec_oce) else frec_oce,
    #                 frec_ssa=None if pd.isna(frec_ssa) else frec_ssa,
    #                 frec_afr_eas=None if pd.isna(frec_afr_eas) else frec_afr_eas,
    #                 frec_afr_swe=None if pd.isna(frec_afr_swe) else frec_afr_swe,
    #                 frec_afr_nor=None if pd.isna(frec_afr_nor) else frec_afr_nor,
    #                 frec_ca=None if pd.isna(frec_ca) else frec_ca,
    #                 frec_sa=None if pd.isna(frec_sa) else frec_sa,
    #                 loss=loss,
    #                 increment=increment,
    #                 unique_number=f"{self.study.id}-{row_number}",
    #                 sphere_radius=self._get_sphere_radius(0),
    #                 stick_radius=self._get_stick_radius(0),
    #             )

    #         for k, v in relations_for_the_end.items():
    #             current_node = nodes.get(k)
    #             if current_node and current_node.pk:
    #                 children_list = []
    #                 for value in v:
    #                     child = nodes.get(value)
    #                     if child and child.pk:
    #                         children_list.append(child)
    #                         for memory_file in pdb_files:
    #                             memory_file.write(
    #                                 self.excel_nomenclator_class.get_atom_connection_record_string(
    #                                     origin_index=k,
    #                                     destination_index=value,
    #                                 )
    #                             )
    #                             memory_file.write("\n")

    #                 current_node.children.set(children_list)

    #                 current_node.sphere_radius = self._get_sphere_radius(
    #                     len(children_list)
    #                 )
    #                 current_node.stick_radius = self._get_stick_radius(
    #                     len(children_list)
    #                 )
    #                 current_node.save(
    #                     update_fields=(
    #                         "sphere_radius",
    #                         "stick_radius",
    #                     )
    #                 )

    #         index = 0
    #         for memory_file in pdb_files:
    #             memory_file.write("END")
    #             file_content = memory_file.getvalue()
    #             memory_file.close()
    #             self.create_pdb_and_persist_on_db(
    #                 file_content=file_content,
    #                 pdb_filename_base=pdb_filename_base,
    #                 suffix=f"excel_{index}",
    #                 study_id=self.study.id,
    #                 kind=PdbFiles.KIND.EXCEL_GENERATED,
    #             )
    #             index += 1

    #         # return pdb_file_0
    #     except Exception as e:
    #         AlleleNode.objects.filter(study=self.study).delete()
    #         self.study.successfull_load = False
    #         self.study.extra_info = e.__str__()
    #         self.study.save()
    #         logger.exception(f"An error occurred during file parsing: {e}")
    #         raise ValueError(f"An error occurred during file parsing: {e}.") from e

    # def _get_sphere_radius(self, children_count):
    #     cached_sphere_radious = cache.get(
    #         f"sphere_radius_for_{children_count}_children"
    #     )
    #     if cached_sphere_radious:
    #         return cached_sphere_radious
    #     new_sphere_radius_value = (
    #         self._get_stick_radius(children_count) * self.sphere_radius_factor
    #     )
    #     cache.set(
    #         f"sphere_radius_for_{children_count}_children",
    #         new_sphere_radius_value,
    #         timeout=None,
    #     )
    #     return new_sphere_radius_value

    # def _get_stick_radius(self, children_count):
    #     cached_stick_radious = cache.get(f"stick_radius_for_{children_count}_children")
    #     if cached_stick_radious:
    #         return cached_stick_radious

    #     if not children_count:
    #         new_stick_radius_value = self.stick_radius_min_value
    #     else:
    #         new_stick_radius_value = (
    #             self.stick_radius_if_children
    #             + self.stick_radius_factor * children_count
    #         )
    #     cache.set(
    #         f"stick_radius_for_{children_count}_children",
    #         new_stick_radius_value,
    #         timeout=None,
    #     )
    #     return new_stick_radius_value
