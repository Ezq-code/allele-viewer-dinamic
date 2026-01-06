import logging


from apps.genes_to_excel.utils.excel_structure_validator import ExcelStructureValidator


logger = logging.getLogger(__name__)


class XslxReader(ExcelStructureValidator):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)

    def proccess_file(self, uploaded_file_id, gene):
        print("Proccessing file data...")
        # data_for_batch_crate = []
        # for index, row in self.input_df.iterrows():
        #     # aquí supongo que sea lo del get_or_create (recuerda que eso devuelve una tupla)
        #     data_for_batch_create.append(Model(
        #         gene=gene, OJO AQUÍ COMO SUBES UN FICHERO ASOCIADO AL GEN LO PASO Y NO HAY QUE LEERLO DEL EXCEL
        #         field2=row[ExcelNomenclators.coord_column_name],
        #         field3=row[ExcelNomenclators.valor_column_name],
        #         field4=row[ExcelNomenclators.color_column_name],))
        # Model.objects.bulk_create(data_for_batch_create)
