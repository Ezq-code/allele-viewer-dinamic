import pandas as pd
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework import parsers, renderers

from ..serializers.uploadexcelserializer import UploadExcelSerializer
from ..utils.xslx_reader import XslxReader


class UploadExcelView(GenericAPIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (
        parsers.FormParser,
        parsers.MultiPartParser,
        parsers.FileUploadParser,
    )
    renderer_classes = (renderers.JSONRenderer,)
    file_content_parser_classes = (renderers.JSONRenderer,)
    serializer_class = UploadExcelSerializer
    """View para cargar archivos Excel y procesar los datos"""

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        archivo = serializer.validated_data["archivo"]
        nombre_archivo = serializer.validated_data["nombre_archivo"]
        print(f"{nombre_archivo}")

        try:
            # Read the Excel file
            df = pd.read_excel(archivo)

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
            ]
            for col in columnas_requeridas:
                if col not in df.columns:
                    return Response(
                        {"error": f"The file must contains the needed columns: {col}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            # Descomentar esto solo para pruebas o si se necesita mostrar los resultados en la lectura
            resultados = XslxReader.proccess_file(df, nombre_archivo)

            return Response(
                {
                    "mensaje": f"Archivo {nombre_archivo} procesado exitosamente",
                    #'resultados': resultados
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": f"Error al procesar el archivo: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
