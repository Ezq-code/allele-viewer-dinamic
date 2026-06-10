from networkx import Graph
from apps.business_app.models.base_allele_node import BaseAlleleNode
from apps.business_app.models.study import Study
from .excel_nomenclators_base import ExcelNomenclatorsBase
from django.core.cache import cache
import pandas as pd
import logging
import networkx as nx


logger = logging.getLogger(__name__)


def find_root_nodes(G):
    """La raíz del grafo dirigido y conexo es el nodo
    que solamente emite, o sea que su orden de out_degree es positivo
    pero su orden de in_degree es igual a 0.
    Encontrar la raíz de un grafo
    Es importante pues en nuestro caso, la raíz indica cual nodo es el generador de todo el grafo
    """
    nodes_in_degree = [(k, v) for k, v in G.in_degree()]
    root_list = []
    for k, v in nodes_in_degree:
        if v == 0:
            root_list.append(k)
    return root_list


def extract_tree(G: Graph, to_return: list, node: int, graph_function):
    if node in to_return:
        return to_return

    to_return.append(node)
    for element in graph_function(node):
        if element not in to_return:
            extract_tree(G, to_return, element, graph_function)

    return to_return


def extract_parents_tree(G: Graph, to_return: list, node: int):
    return extract_tree(
        G=G, to_return=to_return, node=node, graph_function=G.predecessors
    )


def extract_children_tree(G: Graph, to_return: list, node: int):
    return extract_tree(
        G=G, to_return=to_return, node=node, graph_function=G.successors
    )


def create_graph(
    origin_file,
    study: Study,
    excel_nomenclator_class: ExcelNomenclatorsBase,
    output_df=None,
):
    """
    Esta función recibe como parámetro el ide del fichero
    (uploaded_file_id) y almacena los datos del dataframe
    'output_df' en en un grafo. Luego este grafo puede ser usado
    como base de datos de nodos y ejes.

    Si se provee 'output_df', se reutiliza directamente sin releer el archivo Excel.
    """
    # Comprobar caché antes de hacer cualquier I/O
    if BaseAlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=study.id) in cache:
        return

    logger.info(f"Proccessing {study} study to generate graph...")
    G = nx.DiGraph()

    if output_df is None:
        output_df = pd.read_excel(
            origin_file,
            sheet_name=excel_nomenclator_class.output_sheet,
            engine="openpyxl",
        )

    edges_list = []
    try:
        # Loop over each row in the Excel file
        for _, row in output_df.iterrows():
            allele_name = row[excel_nomenclator_class.output_allele_column_name]
            allele_number = row[excel_nomenclator_class.output_number_column_name]

            if pd.isna(allele_name) or pd.isna(allele_number):
                break

            G.add_node(
                allele_number,
                name=allele_name,
                rs=row[excel_nomenclator_class.output_rs_column_name],
                parent=allele_number,  # Allways include itself as parent
                region=row[excel_nomenclator_class.output_region_column_name],
            )
            parents_info = row[excel_nomenclator_class.output_parent_column_name]
            parents = []
            if not pd.isna(parents_info):
                parents = ((parent.strip()) for parent in str(parents_info).split(","))
            for parent in parents:
                if parent == allele_number:
                    continue
                int_parent = int(parent)
                int_allele_number = int(allele_number)
                if (int_parent, int_allele_number) not in edges_list:
                    edges_list.append((int_parent, int_allele_number))

        # Recorrer el diccionario de nodos
        G.add_edges_from(edges_list)  # Add a edges list
        cache.set(
            BaseAlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=study.id),
            G,
            timeout=None,
        )
    except Exception as e:
        raise ValueError(f"An error occurred during file parsing: {e}.") from e
    return G
