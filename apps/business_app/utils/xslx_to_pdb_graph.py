import io
import logging

import pandas as pd

from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.site_configurations import SiteConfiguration
from apps.business_app.utils.excel_reader import ExcelNomenclators, ExcelReader

# Esta es la bilbioteca necesaria para trabajar con grafos
import networkx as nx

logger = logging.getLogger(__name__)


# def find_root_node(G):
#     """La raíz del grafo dirigido y conexo es el nodo
#     que solamente emite, o sea que su orden de out_degree es positivo
#     pero su orden de in_degree es igual a 0.
#     Encontrar la raíz de un grafo
#     Es importante pues en nuestro caso, la raíz indica cual nodo es el generador de todo el grafo
#     """
#     nodes_in_degree = [(k, v) for k, v in G.in_degree()]
#     for k, v in nodes_in_degree:
#         if v == 0:
#             return k


def _extract_adjacent_tree(G, my_list, node, predecessors_true_successor_false=True):
    adjacents = None
    if predecessors_true_successor_false:
        adjacents = list(G.predecessors(node))
    else:
        adjacents = list(G.successors(node))
    if not adjacents:  # Si el nodo es la raíz sale de la función
        return my_list
    else:  # Lo contrario, itera sobre los padres y se llama a si misma
        for element in adjacents:
            my_list.append(element)
            return _extract_adjacent_tree(
                G, my_list, element, predecessors_true_successor_false
            )


class XslxToPdbGraph(ExcelReader):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)
        config = SiteConfiguration.get_solo()
        self.dim = 3  # (config.nx_graph_dim)  # La dimensión no la podemos variar (relacionado con x,y,z por eso tres)
        self.k = config.nx_graph_k  # El óptimo es 1/sqrt(total de nodos), eso asegura que para el grafo en cuestión sea óptimo
        self.scale = (
            config.nx_graph_scale
        )  # Se debe adicionar este parámetro en el payload
        self.iterations = config.nx_graph_training_iterations
        # Se crea una variable para el grafo
        self.G = nx.DiGraph()

    def proccess_initial_file_data(self, uploaded_file_id):
        print("Proccessing initial file data...")
        """
        Esta función recibe como parámetro el ide del fichero
        (uploaded_file_id) y almacena los datos del dataframe
        'output_df' en en un grafo. Luego este grafo puede ser usado 
        como base de datos de nodos y ejes. 
        """
        # Construyendo el grafo con una instancia de NetworkX
        edges_list = []
        try:
            # Loop over each row in the Excel file
            for _, row in self.output_df.iterrows():
                allele_name = row[
                    ExcelNomenclators.output_allele_column_name
                ]  # Solo modifique esta línea
                allele_number = row[ExcelNomenclators.output_number_column_name]
                if pd.isna(allele_name) or pd.isna(
                    row[ExcelNomenclators.output_number_column_name]
                ):
                    break

                self.G.add_node(
                    allele_number,
                    name=allele_name,
                    rs=row[ExcelNomenclators.output_rs_column_name],
                    symbol=row[ExcelNomenclators.output_symbol_column_name],
                    parent=row[ExcelNomenclators.output_number_column_name],
                    regions=row[ExcelNomenclators.output_region_column_name],
                    # SI EXISTE UN CAMPO FECHA SE ADICIONA AQUÍ, por ejemplo
                    # date=row[ExcelNomenclators.output_date_column_name],
                )
                parents_info = row[ExcelNomenclators.output_parent_column_name]
                parents = []
                if not pd.isna(parents_info):
                    parents = (
                        (parent.strip()) for parent in str(parents_info).split(",")
                    )
                for parent in parents:
                    if int(parent) == int(allele_number):
                        continue
                    # self.G.add_edge(int(parent), allele_number)#Adiciona la conexion
                    if (int(parent), int(allele_number)) not in edges_list:
                        edges_list.append((int(parent), int(allele_number)))

            # Recorrer el diccionario de nodos
            self.G.add_edges_from(edges_list)  # Add a edges list
            edges_list = []

        except Exception as e:
            raise ValueError(f"An error occurred during file parsing: {e}.")

    def proccess_pdb_file(
        self, uploaded_file_id, pdb_filename_base, existing_pdb_file=None
    ):
        print("Proccessing PDB file...")
        # Obtener el grafo desde el fichero excel almacenado en un Dataframe
        nodes_list = list(self.G.nodes)
        edges_list = list(self.G.edges)
        # "Pos" contiene las coordenadas necesarias para pintar un grafo en 3D
        # pos: es un diccionario que sigue la estructura {nodo_i: [12 34 567], .....nodo_i-n: [112 -54 67]} con i=0 hasta n
        # Leer las posiciones generadas por NetworkX
        pos = nx.spring_layout(
            self.G, dim=self.dim, k=self.k, scale=self.scale, iterations=self.iterations
        )
        print("Proccessing PDB file...")
        graph_x_index = 0
        graph_y_index = 1
        graph_z_index = 2
        try:
            pdb_files = [io.StringIO() for _ in range(self.coordinates_sets)]
            # Open the PDB file for writing
            # Iterar sobre la lista de nodos
            for node in nodes_list:
                # Write the atom record in the PDB file format
                element = next(
                    self.elements_symbol_iterator
                )  # "AL" #Averiguar que es esto
                node_coordinates = pos[node]
                # print(f"Nodo i: {int(node)}")
                # print(f"Coordenadas: {int(node_coordinates[0] * 100)}")
                for memory_file in pdb_files:
                    try:
                        memory_file.write(
                            ExcelNomenclators.get_atom_record_string(
                                allele_number=int(node),
                                element=element,
                                x_coordinate=int(
                                    node_coordinates[graph_x_index]
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular? Si es porque son valores entre 0 y 1, no se porque aún
                                y_coordinate=int(
                                    node_coordinates[graph_y_index]
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular?
                                z_coordinate=int(
                                    node_coordinates[graph_z_index]
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular?
                            )
                        )
                        memory_file.write("\n")
                    except Exception as ew:
                        raise ValueError(f"An error writing the ATOMs lines: {ew}.")
            # If no changes are made, means that it is the first time upload

            print("Sucedió un cambio..............")
            # CONECT
            for edge in edges_list:
                try:
                    for memory_file in pdb_files:
                        memory_file.write(
                            ExcelNomenclators.get_atom_connection_record_string(
                                origin_index=int(edge[0]),
                                destination_index=int(edge[1]),
                            )
                        )
                        # print(f"Conexión entre nodos: {int(edge[0])} hacia {int(edge[1])}")
                        memory_file.write("\n")
                except Exception as ec:
                    raise ValueError(
                        f"An error occurred during witing CONECT lines: {ec}."
                    )

            index = 0
            try:
                for memory_file in pdb_files:
                    memory_file.write("END")
                    file_content = memory_file.getvalue()
                    memory_file.close()
                    if not existing_pdb_file:
                        self.create_pdb_and_persist_on_db(
                            file_content=file_content,
                            pdb_filename_base=pdb_filename_base,
                            suffix=f"graph_{index}",
                            uploaded_file_id=uploaded_file_id,
                            kind=PdbFiles.KIND.GRAPH_GENERATED,
                        )
                    else:
                        existing_pdb_file.pdb_content = file_content
                        existing_pdb_file.save(update_fields=["pdb_content"])
                    index += 1
            except Exception as ep:
                raise ValueError(f"An error occurred creating PDB object: {ep}.")

            # return pdb_file_0
        except Exception as e:
            raise ValueError(f"An error occurred during file parsing: {e}.")

    def proccess_allele_parents(self, allele_id):
        """
        Esta función recibe como parámetro el
        id del allele (allele_id) y devuelve una lista de nodos
        que integran el árbol del mismo.
        """
        try:
            # root = find_root_node(self.G)
            parents_tree = _extract_adjacent_tree(
                self.G, [], allele_id, predecessors_true_successor_false=True
            )
            children_tree = _extract_adjacent_tree(
                self.G, [], allele_id, predecessors_true_successor_false=False
            )
            return parents_tree, children_tree

        except Exception as e:
            raise ValueError(f"An error occurred during file parsing: {e}.")

    def proccess_alleles_time_line(self, date):
        pass
