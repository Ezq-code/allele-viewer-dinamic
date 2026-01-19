from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import StreamingHttpResponse
from rest_framework import permissions

import json
import time

from apps.business_app.models.gene import Gene
from ..models.gen_data import CaracteristicaGen


class GetGenCharacteristicsView(APIView):
    """
    View optimizada para obtener características de un gen
    Construye el JSON manualmente para mejor rendimiento
    """

    serializer_class = None
    permission_classes = [permissions.AllowAny]

    def get(self, request, gene_code):
        start_time = time.time()

        try:
            # Buscar el gen (case-sensitive o case-insensitive según necesites)
            # Opción 1: Exact match (más rápido)
            gen = Gene.objects.filter(name=gene_code).first()

            # Opción 2: Si necesitas case-insensitive
            # gen = Gen.objects.filter(nombre__iexact=gene_code).first()

            if not gen:
                # Sugerir genes similares
                similar_genes = Gene.objects.filter(
                    name__icontains=gene_code
                ).values_list("nombre", flat=True)[:5]

                return Response(
                    {
                        "error": f"El gen '{gene_code}' no fue encontrado",
                        "suggestions": list(similar_genes)
                        if similar_genes
                        else ["Verifica el nombre del gen"],
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # OPCIÓN 1: Usando ORM con values() (más rápido que serializer)
            caracteristicas = (
                CaracteristicaGen.objects.filter(gen=gen)
                .select_related("gen")
                .values(
                    "id",
                    "gen_id",
                    "archivo_origen",
                    "gene",
                    "cord",
                    "valor",
                    "color",
                    "protein",
                    "alleleasoc",
                    "species",
                    "fecha_creacion",
                )
            )

            # Convertir QuerySet a lista de diccionarios
            data_list = list(caracteristicas)

            # Agregar el nombre del gen a cada registro
            gen_nombre = gen.name
            for item in data_list:
                item["gen_nombre"] = gen_nombre

            processing_time = time.time() - start_time

            return Response(
                {
                    "gene": gene_code,
                    "gene_id": gen.id,
                    "total_characteristics": len(data_list),
                    "processing_time_seconds": round(processing_time, 3),
                    "data": data_list,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": "Error al procesar la solicitud", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetGenCharacteristicsStreamingView(APIView):
    """
    View que streamea los datos en formato JSON para evitar memory issues
    """

    serializer_class = None
    permission_classes = [permissions.AllowAny]

    def get(self, request, gene_code):
        try:
            # Buscar el gen
            gen = Gene.objects.filter(name=gene_code).first()
            if not gen:
                return Response(
                    {"error": f"Gen '{gene_code}' no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Generador que va produciendo chunks de JSON
            def generate_json():
                # Encabezado del JSON
                yield '{"gene": "' + gene_code + '", '
                yield '"gene_id": ' + str(gen.id) + ", "
                yield '"data": ['

                # Obtener datos en chunks
                batch_size = 1000
                caracteristicas = (
                    CaracteristicaGen.objects.filter(gen=gen)
                    .values(
                        "id",
                        "gen_id",
                        "archivo_origen",
                        "gene",
                        "cord",
                        "valor",
                        "color",
                        "protein",
                        "alleleasoc",
                        "species",
                        "fecha_creacion",
                    )
                    .iterator(chunk_size=batch_size)
                )

                first = True
                for item in caracteristicas:
                    if not first:
                        yield ","
                    else:
                        first = False

                    # Agregar nombre del gen
                    item["gen_nombre"] = gen.name

                    # Convertir a JSON
                    yield json.dumps(item, default=str)

                # Cerrar el JSON
                yield "]}"

            # Respuesta streaming
            response = StreamingHttpResponse(
                generate_json(), content_type="application/json"
            )
            response["Content-Disposition"] = (
                f'attachment; filename="{gene_code}_data.json"'
            )
            return response

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Funciona
class CoordinateValuesView(APIView):
    """
    View simplificada para obtener Valor, Color, Protein, Alleleasoc, Species
    de un gen específico en una coordenada específica.
    """

    serializer_class = None
    permission_classes = [permissions.AllowAny]

    def get(self, request, gene_code, cord):
        try:
            # 1. Buscar el gen
            gen = Gene.objects.get(name=gene_code)

            # 2. Buscar las características para ese gen y coordenada
            caracteristicas = CaracteristicaGen.objects.filter(gen=gen, cord=cord)

            # 3. Verificar si existen resultados
            if not caracteristicas.exists():
                return Response(
                    {"error": f"No se encontraron datos para {gene_code} en {cord}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # 4. Crear lista con solo los campos requeridos
            results = []
            for item in caracteristicas:
                results.append(
                    {
                        "Valor": item.valor,
                        "Color": item.color,
                        "Protein": item.protein,
                        "Alleleasoc": item.alleleasoc,
                        "Species": item.species,
                        "Variant": item.variant,
                    }
                )

            # 5. Retornar la respuesta
            return Response(
                {
                    "gene": gene_code,
                    "coordinate": cord,
                    "count": len(results),
                    "data": results,
                },
                status=status.HTTP_200_OK,
            )

        except Gene.DoesNotExist:
            return Response(
                {"error": f"El gen '{gene_code}' no existe"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
