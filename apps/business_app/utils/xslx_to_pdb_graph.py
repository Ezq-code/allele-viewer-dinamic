import io
import logging

import pandas as pd

from apps.business_app.utils.excel_reader import ExcelNomenclators, ExcelReader

# Esta es la bilbioteca necesaria para trabajar con grafos
import networkx as nx

logger = logging.getLogger(__name__)


class XslxToPdbGraph(ExcelReader):
    def __init__(self, origin_file) -> None:
        super().__init__(origin_file)
        self.dim = 3
        self.k = 0.15
        self.iterations = 10
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
                )
                parents = []
                parents_info = row[ExcelNomenclators.output_parent_column_name]
                if not pd.isna(parents_info):
                    parents = (
                        (parent.strip()) for parent in str(parents_info).split(",")
                    )
                for parent in parents:
                    if parent == allele_number:
                        continue
                    # Encuentra la fila en la que esta el padre
                    self.G.add_edge(allele_number, parent)

        except Exception as e:
            raise ValueError(f"An error occurred during file parsing: {e}.")

    def proccess_pdb_file(self, uploaded_file_id, pdb_filename_base):
        print("Proccessing PDB file...")
        # Obtener el grafo desde el fichero excel almacenado en un Dataframe
        nodes_list = list(self.G.nodes)
        edges_list = list(self.G.edges)
        # "Pos" contiene las coordenadas necesarias para pintar un grafo en 3D
        # pos: es un diccionario que sigue la estructura {nodo_i: [12 34 567], .....nodo_i-n: [112 -54 67]} con i=0 hasta n
        # Leer las posiciones generadas por NetworkX
        pos = nx.spring_layout(
            self.G, dim=self.dim, k=self.k, iterations=self.iterations
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
                                    node_coordinates[graph_x_index] * 100
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular? Si es porque son valores entre 0 y 1, no se porque aún
                                y_coordinate=int(
                                    node_coordinates[graph_y_index] * 100
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular?
                                z_coordinate=int(
                                    node_coordinates[graph_z_index] * 100
                                ),  # Esto correcto, TODO este 100 es por algún motivo en particular?
                            )
                        )
                        memory_file.write("\n")
                    except Exception as ew:
                        raise ValueError(f"An error writing the ATOMs lines: {ew}.")

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
                    self.create_pdb_and_persist_on_db(
                        memory_file=memory_file,
                        pdb_filename_base=pdb_filename_base,
                        suffix=f"graph_{index}",
                        uploaded_file_id=uploaded_file_id,
                    )
                    index += 1
            except Exception as ep:
                raise ValueError(f"An error occurred creating PDB object: {ep}.")

            # return pdb_file_0
        except Exception as e:
            raise ValueError(f"An error occurred during file parsing: {e}.")