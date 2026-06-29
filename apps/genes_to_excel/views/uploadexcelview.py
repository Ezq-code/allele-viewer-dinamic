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
