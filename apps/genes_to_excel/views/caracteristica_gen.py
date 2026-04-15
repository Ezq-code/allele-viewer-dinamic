from rest_framework.generics import GenericAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets


from ..serializers.caracteristica_gen import CaracteristicaGenSerializer
from ..models.caracteristica_gen import CaracteristicaGen


class CaracteristicaGenViewSet(viewsets.ReadOnlyModelViewSet, GenericAPIView):
    queryset = CaracteristicaGen.objects.all()
    serializer_class = CaracteristicaGenSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["gen__name"]
    search_fields = ["gen__name", "gene"]


"""
    @action(detail=False, methods=['get'], url_path='matriz')
    def obtener_matriz(self, request):
        
        gen_nombre = request.query_params.get('gen')
        
        if not gen_nombre:
            return Response({'error': 'Se requiere el parámetro gen'}, status=400)
        
        # Obtener todos los registros del gen
        queryset = self.get_queryset().filter(gen__name=gen_nombre)
        
        # Diccionario para almacenar los datos
        cabeceras = []  # Lista de {cord, protein}
        alelos_data = defaultdict(lambda: defaultdict(dict))  # alelo -> {cord -> {valor, color}}
        
        for registro in queryset:
            cord = registro.cord
            valor = registro.valor
            color = registro.color
            protein = registro.protein
            order_one = float(registro.order_one) if registro.order_one else 0
            order_two = float(registro.order_two) if registro.order_two else 0
            order_three = float(registro.order_three) if registro.order_three else 0
            
            # Determinar si es cabecera o valor
            # Las cabeceras tienen valores como "V3I", "A5P", etc. (nombres de mutaciones)
            # Los valores son letras simples o cadenas cortas como "V", "A", "L"
            es_cabecera = valor and len(valor) > 2 and not valor.startswith('A*')
            
            if es_cabecera or protein:
                # Es una cabecera (nombre de mutación)
                if not any(c['cord'] == cord for c in cabeceras):
                    cabeceras.append({
                        'cord': cord,
                        'protein': protein or valor,
                        'order_one': order_one,
                        'order_two': order_two,
                        'order_three': order_three
                    })
            elif valor and len(valor) <= 2 and valor not in ['', 'Protein']:
                # Es un valor de aminoácido
                # Necesitamos identificar a qué alelo pertenece
                # Por ahora, usamos order_one como identificador de alelo
                alelo_id = f"Alelo_{order_one}_{order_two}"
                
                # Intentar obtener nombre del alelo de algún registro
                if registro.alleleasoc:
                    alelo_id = registro.alleleasoc
                
                alelos_data[alelo_id][cord] = {
                    'valor': valor,
                    'color': color
                }
        
        # Ordenar cabeceras
        cabeceras_ordenadas = sorted(cabeceras, key=lambda x: (x['order_one'], x['order_two'], x['order_three']))
        
        # Crear lista de alelos
        alelos = list(alelos_data.keys())
        
        # Crear matriz
        matriz = []
        for alelo in alelos:
            fila = []
            for cab in cabeceras_ordenadas:
                valor_info = alelos_data[alelo].get(cab['cord'], {'valor': '', 'color': '255,255,255'})
                fila.append(valor_info)
            matriz.append({
                'alelo': alelo,
                'valores': fila
            })
        
        return Response({
            'gen': gen_nombre,
            'cabeceras': cabeceras_ordenadas,
            'alelos': alelos,
            'matriz': matriz,
            'total_cabeceras': len(cabeceras_ordenadas),
            'total_alelos': len(alelos)
        })
"""
