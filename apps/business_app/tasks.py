import logging
import os
from celery import shared_task
from django.core.management import call_command
from django.core.cache import cache
from django.db.utils import OperationalError
from apps.business_app.utils.graph_functions import create_graph

from apps.users_app.models.country import Country
from apps.business_app.models.sub_country import SubCountry
from apps.business_app.models.gene import Gene
from apps.business_app.models.study import Study
from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.models.site_configurations import SiteConfiguration

from apps.business_app.utils.xslx_to_pdb_graph import XslxToPdbGraph
from apps.business_app.utils.graph_functions import (
    extract_children_tree,
    extract_parents_tree,
)
from apps.common.utils.pusher_client import PusherClient
from apps.common.tasks import send_pusher_trigger_task
from apps.business_app.utils.excel_nomenclators_base import ExcelNomenclatorsBase
from apps.business_app.utils.excel_nomenclator_by_allele_study import (
    ExcelNomenclatorsByAlleleStudy,
)
from apps.business_app.utils.excel_nomenclator_by_ancesters_plus_est_study import (
    ExcelNomenclatorsByAncestersPlusEstStudy,
)
from apps.business_app.utils.excel_nomenclator_by_ancesters_minus_est_study import (
    ExcelNomenclatorsByAncestersMinusEstStudy,
)
from apps.business_app.utils.excel_nomenclator_by_location_plus_est_study import (
    ExcelNomenclatorsByLocationPlusEstStudy,
)
from apps.business_app.utils.excel_nomenclator_by_location_minus_est_study import (
    ExcelNomenclatorsByLocationMinusEstStudy,
)
from apps.business_app.models.study_type import StudyType
from apps.business_app.utils.xslx_to_pdb_by_allele_study import XslxToPdbByAlleleStudy  # noqa: F401

from apps.business_app.utils.xslx_to_pdb_by_ancesters_plus_est_study import (
    XslxToPdbByAncestersPlusEstStudy,  # noqa: F401
)
from apps.business_app.utils.xslx_to_pdb_by_ancesters_minus_est_study import (
    XslxToPdbByAncestersMinusEstStudy,  # noqa: F401
)
from apps.business_app.utils.xslx_to_pdb_by_location_plus_est_study import (
    XslxToPdbByLocationPlusEstStudy,  # noqa: F401
)
from apps.business_app.utils.xslx_to_pdb_by_location_minus_est_study import (
    XslxToPdbByLocationMinusEstStudy,  # noqa: F401
)


logger = logging.getLogger(__name__)

# Registry de clases procesadoras permitidas. Usar este dict en lugar de eval()
# evita ejecución de código arbitrario y produce errores claros ante nombres inválidos.
# Los tests que parchean estas clases en el módulo siguen funcionando porque
# _resolve_processor_class() lee del módulo en tiempo de ejecución.
PROCESSOR_CLASS_REGISTRY = {
    "XslxToPdbByAlleleStudy",
    "XslxToPdbByAncestersPlusEstStudy",
    "XslxToPdbByAncestersMinusEstStudy",
    "XslxToPdbByLocationPlusEstStudy",
    "XslxToPdbByLocationMinusEstStudy",
}


def _resolve_processor_class(class_name: str):
    """Resuelve una clase procesadora por nombre usando el registry de nombres permitidos.

    Lanza ValueError si el nombre no está en el registry, y NameError si la
    clase no se encuentra en el módulo (no debería ocurrir en operación normal).
    """
    if class_name not in PROCESSOR_CLASS_REGISTRY:
        raise ValueError(
            f"Processor class '{class_name}' is not registered. "
            f"Allowed classes: {sorted(PROCESSOR_CLASS_REGISTRY)}"
        )
    module_globals = globals()
    if class_name not in module_globals:
        raise NameError(
            f"Processor class '{class_name}' is registered but not found in module scope."
        )
    return module_globals[class_name]


def _is_db_locked_error(error):
    current_error = error
    while current_error:
        current_error_msg = str(current_error).lower()
        if (
            isinstance(current_error, OperationalError)
            and "database is locked" in current_error_msg
        ):
            return True
        if "database is locked" in current_error_msg:
            return True
        current_error = current_error.__cause__ or current_error.__context__
    return False


# @shared_task(bind=True, name="process_uploaded_file_task", max_retries=4)


@shared_task(bind=True, name="proccess_individual_processor_class", max_retries=4)
def proccess_individual_processor_class(self, processor_class, uploaded_file_id):
    """Procesa un archivo subido usando la clase procesadora indicada.

    Args:
        processor_class: Nombre de la clase procesadora (debe estar en PROCESSOR_CLASS_REGISTRY).
        uploaded_file_id: ID del UploadedFiles a procesar.
    """
    from apps.business_app.models.uploaded_files import UploadedFiles

    uploaded_file = UploadedFiles.objects.get(id=uploaded_file_id)
    original_file = uploaded_file.original_file
    file_name, _ = os.path.splitext(original_file.name)

    global_configuration = SiteConfiguration.get_solo()

    # Resuelve la clase por nombre usando el registry seguro en lugar de eval().
    processor_class = _resolve_processor_class(processor_class)
    study = None

    try:
        processor_object = processor_class(
            original_file,
            global_configuration,
            uploaded_file_id=uploaded_file_id,
        )
        study = processor_object.study  # Guardar referencia al estudio para el pusher
        if global_configuration.upload_to_drive or isinstance(
            processor_object, XslxToPdbGraph
        ):
            processor_object.proccess_initial_file_data(uploaded_file_id)
        processor_object.proccess_pdb_file(uploaded_file_id, file_name)
        if hasattr(processor_object, "study"):
            # Construir el grafo con el dataframe ya cargado en memoria
            # para evitar releer el archivo Excel desde disco.
            create_graph(
                origin_file=None,
                study=processor_object.study,
                excel_nomenclator_class=processor_object.excel_nomenclator_class,
                output_df=processor_object.output_df,
            )
            fill_predecessors_and_sucessors_for_all_nodes(
                study_id=processor_object.study.id
            )

    except Exception as processor_error:
        logger.exception(
            "Error processing uploaded file %s with processor %s: %s",
            uploaded_file_id,
            processor_class,
            processor_error,
            exc_info=True,
        )
    finally:
        # study puede ser None si el procesador falló antes de asignarlo,
        # o ser un SimpleNamespace en tests que no expone refresh_from_db.
        if study is not None and hasattr(study, "refresh_from_db"):
            study.refresh_from_db()
        if study is not None:
            send_pusher_trigger_task.delay(
                channel=PusherClient.CELERY_TASK_CHANNEL,
                event=PusherClient.STUDY_PROCESSED,
                data={
                    "study_id": study.id,
                    "status": study.successfull_load,
                },
            )


def _get_graph_info(study_id, node_number, function_to_call):
    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=study_id)
    graph = cache.get(graph_key)
    if not graph:
        build_uploaded_file_graph_cache_task(study_id)
        graph = cache.get(graph_key)
    return set(function_to_call(graph, [], node_number))


def fill_predecessors_and_sucessors_for_all_nodes(study_id: int):
    model_class = None
    from apps.business_app.models.study_type import StudyType

    if (
        Study.objects.get(id=study_id).study_type.classification
        == StudyType.CLASSIFICATION.ALLELE
    ):
        from apps.business_app.models.allele_node import AlleleNode

        model_class = AlleleNode
    else:
        from apps.business_app.models.protein_node import ProteinNode

        model_class = ProteinNode

    nodes = model_class.objects.filter(
        study_id=study_id
    ).all()  # TODO make generic somehow
    list_to_update = []
    for node in nodes:
        parent_tree = _get_graph_info(
            study_id=study_id,
            node_number=node.number,
            function_to_call=extract_parents_tree,
        )
        children_tree = _get_graph_info(
            study_id=study_id,
            node_number=node.number,
            function_to_call=extract_children_tree,
        )
        node.sucessors = list(children_tree)
        node.predecessors = list(parent_tree)
        list_to_update.append(node)
    model_class.objects.bulk_update(
        list_to_update, fields=["sucessors", "predecessors"]
    )


@shared_task(name="build_uploaded_file_graph_cache_task")
def build_uploaded_file_graph_cache_task(study_id):
    try:
        study = Study.objects.select_related("study_type").get(id=study_id)
        uploaded_file = study.uploaded_file
        excel_nomenclator_class = ExcelNomenclatorsBase
        study_type_name = study.study_type.name if study.study_type else ""
        if study_type_name == StudyType.STUDY_NAME_ANCESTERS_PLUS_EST:
            excel_nomenclator_class = ExcelNomenclatorsByAncestersPlusEstStudy
        elif study_type_name == StudyType.STUDY_NAME_ANCESTERS_MINUS_EST:
            excel_nomenclator_class = ExcelNomenclatorsByAncestersMinusEstStudy
        elif study_type_name == StudyType.STUDY_NAME_LOCATION_PLUS_EST:
            excel_nomenclator_class = ExcelNomenclatorsByLocationPlusEstStudy
        elif study_type_name == StudyType.STUDY_NAME_LOCATION_MINUS_EST:
            excel_nomenclator_class = ExcelNomenclatorsByLocationMinusEstStudy
        elif study_type_name == StudyType.STUDY_NAME_GENETIC_ALLELE:
            excel_nomenclator_class = ExcelNomenclatorsByAlleleStudy

        create_graph(uploaded_file.original_file, study, excel_nomenclator_class)
        # from apps.business_app.models.uploaded_files import UploadedFiles

        # uploaded_file = UploadedFiles.objects.get(id=uploaded_file_id)
        # global_configuration = SiteConfiguration.get_solo()
        # processor_object = XslxToPdbGraph(
        #     uploaded_file.original_file,
        #     global_configuration,
        #     uploaded_file_id=uploaded_file.id,
        # )
        # processor_object.proccess_initial_file_data(study_id)
        return {"status": "success", "study_id": study_id}
    except Exception as e:
        logger.exception(
            "Error building graph cache for study %s in uploaded file %s: %s",
            study_id,
            uploaded_file.id,
            str(e),
        )
        raise


@shared_task(name="create_subcountries_task")
def create_subcountries_task():
    """Create SubCountry objects for each Country.
    For United States (code='US'), create 3 subregions with identificative suffixes.
    For other countries, create one SubCountry with the same name."""
    subcountries_to_create = []

    for country in Country.objects.all():
        if country.code == "US":
            subcountries_to_create.append(
                SubCountry(name=f"{country.name} - East", country=country),
            )
            subcountries_to_create.append(
                SubCountry(name=f"{country.name} - West", country=country),
            )
            subcountries_to_create.append(
                SubCountry(
                    name=f"{country.name} - Central and Mountains", country=country
                ),
            )
        else:
            # Create one SubCountry with the same name as the country
            subcountries_to_create.append(
                SubCountry(name=country.name, country=country)
            )

    # Create all SubCountry objects in a single batch operation
    SubCountry.objects.bulk_create(subcountries_to_create)


@shared_task(name="update_gene_list_for_groups_task")
def update_gene_list_for_groups_task():
    call_command("loaddata", "genegroups_empty.json")

    dict_for_update = {
        1: [  # The key 1 corresponds to Pharmacodynamic GeneGroup
            "HLA-A",
            "HLA-B",
            "HLA-C",
            "HLA-E",
            "HLA-F",
            "HLA-G",
            "HLA-DRB1",
            "HLA-DPB1",
            "HLA-DRB3",
            "HLA-DRB5",
            "HLA-DRP1",
            "HLA-DRQ1",
            "HLA-DRA",
            "HLA-DQA1",
            "HLA-DQB1",
            "HLA-DPA1",
            "TLR1",
            "TLR6",
            "TLR10",
            "OAS1",
            "ACE",
            "ADRA1A",
            "ADRA1B",
            "ADRA1D",
            "ADRA2A",
            "ADRA2B",
            "ADRA2C",
            "ADRB1",
            "ADRB2",
            "ADRB3",
            "ANK2",
            "ATP1A1",
            "ATP1A2",
            "BRAF",
            "CACNA1C",
            "CACNA1D",
            "CACNA1G",
            "CACNA1H",
            "CASQ2",
            "CFTR",
            "CRHR1",
            "DRD1",
            "DRD2",
            "DRD3",
            "DRD4",
            "DRD5",
            "DSP",
            "EGFR",
            "ERBB2",
            "ERBB3",
            "ERBB4",
            "ESR1",
            "FDFT1",
            "FDPS",
            "FGFR1",
            "FKBP1A",
            "FLT3",
            "GABRA1",
            "GABRG2",
            "GJA1",
            "GJA5",
            "GJA7",
            "GRK4",
            "HCN2",
            "HCN4",
            "HMGCR",
            "HMGCS1",
            "HSD11B2",
            "HTR1A",
            "HTR1B",
            "HTR1D",
            "HTR1E",
            "HTR1F",
            "HTR2A",
            "HTR2B",
            "HTR2C",
            "HTR3A",
            "HTR3B",
            "HTR3C",
            "HTR3D",
            "HTR3E",
            "HTR4",
            "HTR5A",
            "HTR6",
            "HTR7",
            "JUP",
            "KCNA5",
            "KCND3",
            "KCNH2",
            "KCNJ11",
            "KCNJ2",
            "KCNJ3",
            "KCNJ4",
            "KCNJ5",
            "KCNJ8",
            "KCNK1",
            "KCNK3",
            "KCNQ1",
            "KIT",
            "LMNA",
            "NEDD4L",
            "NPR1",
            "NR1I2",
            "OPRM1",
            "PDGFR",
            "PEAR1",
            "PPIA",
            "PTGS1",
            "PTGS2",
            "RAF1",
            "RET",
            "RYR1",
            "RYR2",
            "SCN5A",
            "SCNN1A",
            "SCNN1B",
            "SCNN1D",
            "SCNN1G",
            "SERCA1",
            "SERCA2",
            "SGK1",
            "SLC6A2",
            "SLC6A3",
            "SLC6A4",
            "SLC8A2",
            "SLC8A3",
            "VDR",
            "VEGFR1",
            "VEGFR2",
            "VEGFR3",
            "VKORC1",
            "WNK1",
            "WNK4",
        ],
        2: [  # The key 2 corresponds to Pharmacokinetic GeneGroup
            "CYP2C19",
            "CYP2D6",
            "NAT2",
            "CYP1A1",
            "CYP1A2",
            "CYP2A6",
            "CYP2B6",
            "CYP2C8",
            "CYP2C9",
            "CYP2E1",
            "CYP2J2",
            "CYP3A4",
            "CYP3A5",
            "CYP4F2",
            "ABCB1",
            "ABCC2",
            "ABCG2",
            "ADH1B",
            "APOE",
            "BCHE",
            "DPYD",
            "EPHX1",
            "G6PD",
            "GSTM1",
            "GSTP1",
            "GSTT1",
            "GSTT2B",
            "NAT1",
            "NUDT15",
            "OPRM1",
            "SLC15A2",
            "SLC22A1",
            "SLC22A2",
            "SLC22A6",
            "SLCO1B1",
            "SLCO1B3",
            "SLCO2B1",
            "SULT1A1",
            "TPMT",
            "UGT1A1",
            "UGT1A3",
            "UGT1A4",
            "UGT1A6",
            "UGT1A8",
            "UGT1A9",
            "UGT2B15",
            "UGT2B17",
            "UGT2B7",
            "SLC2A4",
            "SLC2A9",
            "SLC6A2",
            "SLC6A3",
            "SLC6A4",
            "SLC12A1",
            "SLC12A3",
            "SLC22A3",
            "SLC22A12",
        ],
        4: [  # The key 4 corresponds to Prioritized Gene
            "HLA-A",
            "HLA-B",
            "HLA-C",
            "HLA-DRB1",
            "HLA-DPB1",
            "HLA-DRP1",
            "HLA-DRQ1",
        ],
    }

    for gene_group_id, gene_list in dict_for_update.items():
        try:
            gene_group = GeneGroups.objects.get(id=gene_group_id)
            gene_group.genes.clear()
            existing_gene_names = Gene.objects.filter(name__in=gene_list).values_list(
                "name", flat=True
            )
            missing_gene_names = list(set(gene_list) - set(existing_gene_names))

            if missing_gene_names:
                Gene.objects.bulk_create(
                    [Gene(name=name) for name in missing_gene_names]
                )

                missing_genes = Gene.objects.filter(name__in=missing_gene_names)
                gene_status_list = GeneStatus.objects.all()
                gene_status_middle_list = []
                for gen in missing_genes:
                    gene_status_middle_list.extend(
                        [
                            GeneStatusMiddle(
                                gene=gen,
                                gene_status=gene_status,
                            )
                            for gene_status in gene_status_list
                        ]
                    )
                GeneStatusMiddle.objects.bulk_create(gene_status_middle_list)

            genes_to_add = Gene.objects.filter(name__in=gene_list)
            gene_group.genes.add(*genes_to_add)

        except GeneGroups.DoesNotExist:
            logger.exception(
                "Error: GeneGroups con id=%s no fue encontrado. Omitiendo este grupo.",
                gene_group_id,
            )
        except Exception as exc:
            logger.exception(
                "Ocurrió un error inesperado al procesar el grupo %s: %s",
                gene_group_id,
                exc,
            )
            raise

    Gene.objects.filter(groups__isnull=True).delete()

    return {
        "status": "success",
        "processed_groups": list(dict_for_update.keys()),
    }


@shared_task(name="add_diseases_task")
def add_diseases_task(_previous_result=None):
    from apps.business_app.management.commands.load_gene_data import Command

    Command().add_diseases()

    return {"status": "success", "message": "Diseases loaded"}
