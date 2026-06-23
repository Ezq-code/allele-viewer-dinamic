import pandas as pd
import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework import parsers, renderers
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
import time
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile

from ..serializers.uploadexcelserializer import UploadExcelSerializer
from ..utils.xslx_reader import XslxReader

from rest_framework.views import APIView

logger = logging.getLogger(__name__)


# Decorador personalizado mejorado
def excel_upload_schema():
    """Decorador para endpoints que reciben archivos Excel"""
    return extend_schema(
        summary="Upload Excel file",
        description="Upload an Excel file to process genetic data",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "archivo": {
                        "type": "string",
                        "format": "binary",
                        "description": "Excel file (.xlsx, .xls) with columns: Gene, Cord, Valor, Color, Protein, Alleleasoc, Species, Variant, Order1, Order2, Order3",
                    },
                    "nombre_archivo": {
                        "type": "string",
                        "description": "Descriptive name for the file (optional)",
                        "required": False,
                    },
                },
                "required": ["archivo"],
            }
        },
        responses={
            201: {
                "description": "File processed successfully",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "mensaje": {"type": "string"},
                                "resultados": {
                                    "type": "object",
                                    "properties": {
                                        "genes_procesados": {"type": "integer"},
                                        "caracteristicas_creadas": {"type": "integer"},
                                        "caracteristicas_actualizadas": {"type": "integer"},
                                        "caracteristicas_omitidas": {"type": "integer"},
                                        "total_filas": {"type": "integer"},
                                        "errores": {"type": "array"},
                                        "tiempo_procesamiento": {"type": "number"}
                                    }
                                },
                            },
                        }
                    }
                },
            },
            400: {
                "description": "Error processing file",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "error": {"type": "string"},
                                "detalle": {"type": "string", "nullable": True}
                            }
                        }
                    }
                }
            }
        },
        tags=["Excel Processing"],
    )


class UploadExcelView(APIView):
    throttle_classes = ()
    parser_classes = (
        parsers.FormParser,
        parsers.MultiPartParser,
    )
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = UploadExcelSerializer
    permission_classes = [permissions.AllowAny]

    """View para cargar archivos Excel y procesar los datos"""

    def _validar_columnas(self, df):
        """Valida que el DataFrame tenga todas las columnas necesarias"""
        columnas_requeridas = [
            "Gene", "Cord", "Valor", "Color", "Protein", 
            "Alleleasoc", "Species", "Variant", "Order1", 
            "Order2", "Order3", "NCBI_Link"
        ]
        
        columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
        
        if columnas_faltantes:
            return False, columnas_faltantes
        return True, []

    def _leer_excel_optimizado(self, archivo):
        """
        Lee el Excel optimizando el uso de memoria.
        Soporta archivos grandes y múltiples hojas.
        """
        # Detectar tipo de archivo para optimizar
        if isinstance(archivo, TemporaryUploadedFile):
            logger.info(f"Archivo temporal grande: {archivo.size} bytes")
        elif isinstance(archivo, InMemoryUploadedFile):
            logger.info(f"Archivo en memoria: {archivo.size} bytes")
        
        start_time = time.time()
        
        # Leer todas las hojas de manera eficiente
        try:
            # Usar el archivo directamente sin crear ExcelFile primero
            excel_file = pd.ExcelFile(archivo)
            sheets_count = len(excel_file.sheet_names)
            logger.info(f"Leyendo {sheets_count} hoja(s) del archivo Excel")
            
            all_dfs = []
            total_filas = 0
            
            for sheet_name in excel_file.sheet_names:
                logger.info(f"Leyendo hoja: {sheet_name}")
                
                # Leer cada hoja con optimizaciones
                df_sheet = pd.read_excel(
                    excel_file, 
                    sheet_name=sheet_name,
                    dtype=str,  # Leer todo como string inicialmente para evitar warnings
                    engine='openpyxl',  # Específico para .xlsx
                    keep_default_na=False,  # Mejorar rendimiento
                    na_filter=False  # Deshabilitar filtro de NaN si no es necesario
                )
                
                filas_hoja = len(df_sheet)
                total_filas += filas_hoja
                logger.info(f"  {filas_hoja} filas leídas")
                all_dfs.append(df_sheet)
            
            # Combinar todas las hojas
            if all_dfs:
                df = pd.concat(all_dfs, ignore_index=True)
                elapsed_time = time.time() - start_time
                logger.info(f"Excel cargado: {total_filas} filas totales en {elapsed_time:.2f} segundos")
                return df
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error leyendo Excel: {e}", exc_info=True)
            raise

    @excel_upload_schema()
    def post(self, request):
        start_time = time.time()
        
        # Validar serializer
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Errores de validación: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        archivo = serializer.validated_data["archivo"]
        nombre_archivo = serializer.validated_data.get(
            "nombre_archivo", archivo.name
        )  # Usar nombre del archivo como fallback
        
        logger.info(f"Procesando archivo: {nombre_archivo}")
        logger.info(f"Tamaño del archivo: {archivo.size} bytes")

        try:
            # Leer Excel optimizado
            df = self._leer_excel_optimizado(archivo)
            
            if df is None or df.empty:
                return Response(
                    {"error": "El archivo Excel está vacío o no contiene datos válidos"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validar columnas
            columnas_validas, columnas_faltantes = self._validar_columnas(df)
            if not columnas_validas:
                error_msg = f"El archivo debe contener las columnas requeridas: {', '.join(columnas_faltantes)}"
                logger.warning(error_msg)
                return Response(
                    {"error": error_msg},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            logger.info(f"Columnas validadas correctamente. Total filas: {len(df)}")
            
            # Procesar con XslxReader optimizado
            logger.info("Iniciando procesamiento con XslxReader...")
            reader = XslxReader()
            resultados = reader.proccess_file(df, nombre_archivo)
            
            # Agregar tiempo de procesamiento a resultados
            resultados["tiempo_procesamiento"] = time.time() - start_time
            
            # Log de resultados
            logger.info(f"✅ Procesamiento completado en {resultados['tiempo_procesamiento']:.2f} segundos")
            logger.info(f"Resultados: {resultados}")
            
            # Preparar respuesta según éxito/error
            if resultados.get("errores") and len(resultados["errores"]) > 0:
                # Hubo errores pero se procesaron algunas filas
                status_code = status.HTTP_207_MULTI_STATUS if len(resultados["errores"]) < len(df) else status.HTTP_400_BAD_REQUEST
                
                return Response(
                    {
                        "mensaje": f"Archivo {nombre_archivo} procesado con {len(resultados['errores'])} errores",
                        "resultados": resultados,
                        "advertencia": "Algunas filas no se procesaron correctamente"
                    },
                    status=status_code,
                )
            else:
                # Todo exitoso
                return Response(
                    {
                        "mensaje": f"Archivo {nombre_archivo} procesado exitosamente",
                        "resultados": resultados
                    },
                    status=status.HTTP_201_CREATED,
                )

        except pd.errors.EmptyDataError:
            logger.error("Archivo Excel vacío")
            return Response(
                {"error": "El archivo Excel está vacío"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except pd.errors.ParserError as e:
            logger.error(f"Error de parsing del Excel: {e}")
            return Response(
                {"error": "Error al parsear el archivo Excel", "detalle": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except MemoryError:
            logger.error("Memoria insuficiente para procesar el archivo")
            return Response(
                {"error": "El archivo es demasiado grande para procesarlo. Por favor, divida el archivo en partes más pequeñas."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
        except Exception as e:
            logger.error(f"Error inesperado procesando archivo: {e}", exc_info=True)
            return Response(
                {"error": f"Error procesando el archivo: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

# Decorador personalizado mejorado
def excel_upload_schema():
    """Decorador para endpoints que reciben archivos Excel"""
    return extend_schema(
        summary="Upload Excel file",
        description="Upload an Excel file to process genetic data",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "archivo": {
                        "type": "string",
                        "format": "binary",
                        "description": "Excel file (.xlsx, .xls) with columns: Gene, Cord, Valor, Color, Protein, Alleleasoc, Species, Variant",
                    },
                    "nombre_archivo": {
                        "type": "string",
                        "description": "Descriptive name for the file (optional)",
                        "required": False,
                    },
                },
                "required": ["archivo"],
            }
        },
        responses={
            201: {
                "description": "File processed successfully",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "mensaje": {"type": "string"},
                                "resultados": {"type": "object", "nullable": True},
                            },
                        }
                    }
                },
            }
        },
        tags=["Excel Processing"],
    )


class UploadExcelView(APIView):
    throttle_classes = ()
    parser_classes = (
        parsers.FormParser,
        parsers.MultiPartParser,
        # parsers.FileUploadParser,
    )
    renderer_classes = (renderers.JSONRenderer,)
    file_content_parser_classes = (renderers.JSONRenderer,)
    serializer_class = UploadExcelSerializer
    permission_classes = [permissions.AllowAny]

    """View para cargar archivos Excel y procesar los datos"""

    @excel_upload_schema()
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        archivo = serializer.validated_data["archivo"]
        nombre_archivo = serializer.validated_data[
            "nombre_archivo"
        ]  # serializer.validated_data.get("nombre_archivo", archivo.name)
        logger.info(f"Este es el nombre del archivo: {nombre_archivo}")

        try:
            # Read the Excel file
            excel_file = pd.ExcelFile(
                archivo
            )  # Revisar si no necesita un codificador específico

            # Create an empty list to store DataFrames from all sheets
            all_dfs = []

            # Read each sheet and append to the list
            for sheet_name in excel_file.sheet_names:
                df_sheet = pd.read_excel(excel_file, sheet_name=sheet_name)
                logger.info(f" Reading {sheet_name} gene")
                all_dfs.append(df_sheet)

            # Combine all DataFrames into one
            df = pd.concat(all_dfs, ignore_index=True)

            # Verify that the needed columns exits
            columnas_requeridas = [
                "Gene",
                "Cord",
                "Valor",
                "Color",
                "Protein",
                "Alleleasoc",
                "Species",
                "Variant",
                "Order1",
                "Order2",
                "Order3",
                "NCBI_Link",
            ]
            for col in columnas_requeridas:
                if col not in df.columns:
                    return Response(
                        {"error": f"The file must contains the needed columns: {col}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Descomentar esto solo para pruebas o si se necesita mostrar los resultados en la lectura
            logger.info("Procesar con XslxReader")
            
            reader = XslxReader()
            resultados = reader.proccess_file(df, nombre_archivo)

            #resultados = XslxReader(archivo).proccess_file(df, nombre_archivo)
            # resultados = XslxReader.proccess_file(df, nombre_archivo)

            logger.info(resultados)
            return Response(
                {
                    "mensaje": f"File {nombre_archivo} processed successfully",
                    #'resultados': resultados
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": f"Error processing the file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
