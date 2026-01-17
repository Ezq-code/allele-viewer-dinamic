# views/admin_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from apps.business_app.models.gene import Gene
from ..models.gen_data import CaracteristicaGen
import logging
from rest_framework import permissions

logger = logging.getLogger(__name__)


class ClearAppDataView(APIView):
    """
    View para limpiar datos solo de las tablas de Características
    """
    serializer_class = None 
    permission_classes = [permissions.AllowAny] 

    def delete(self, request):
        try:
            with transaction.atomic():
                # Eliminar en orden correcto (primero las dependencias)
                count_caracteristicas = CaracteristicaGen.objects.count()
                count_genes = Gene.objects.count()

                # Eliminar características primero (dependen de genes)
                CaracteristicaGen.objects.all().delete()

                return Response(
                    {
                        "message": "Datos eliminados exitosamente",
                        "deleted": {
                            "CaracteristicaGen": count_caracteristicas,
                            "Gen": count_genes,
                        },
                        "total_deleted": count_caracteristicas + count_genes,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Error al eliminar datos: {str(e)}")
            return Response(
                {"error": "Error al eliminar datos", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
