from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.business_app.models import Layer


# Listar los layers si son visibles
@csrf_exempt
def list_layers(request):
    layers = Layer.objects.all()
    data = [
        {
            "id": layer.id,
            "name": layer.name,
            "is_visible": layer.is_visible,
        }
        for layer in layers
    ]
    return JsonResponse(data, safe=False)
