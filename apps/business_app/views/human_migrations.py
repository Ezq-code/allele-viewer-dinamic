from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from apps.business_app.models import Feature


@csrf_exempt
def feature_list(request):
    features = Feature.objects.all()
    features_data = [
        {
            "feature_type": feature.feature_type,
            "feature_id": feature.feature_id,
            "mag": feature.mag,
            "place": feature.place,
            "time": feature.time,
            "title": feature.title,
            "timefinal": feature.timefinal,
            "geometry_type": feature.geometry_type,
            "coordinates": feature.coordinates,
        } for feature in features
    ]
    return JsonResponse({"features": features_data})



@csrf_exempt  # Permite requests POST sin CSRF token
def feature_create(request):
    if request.method == "POST":
        data = request.POST
        feature = Feature.objects.create(
            # feature_type=data.get("feature_type"),
            feature_id=int(data.get("feature_id")),
            mag=data.get("mag"),
            place=data.get("place"),
            time=int(data.get("time")),
            title=data.get("title"),
            timefinal=int(data.get("timefinal")),
            # geometry_type=data.get("geometry_type"),
            # coordinates=data.get("coordinates"),
        )
        return JsonResponse({"success": True, "feature_id": feature.feature_id})
    return JsonResponse({"success": False})



# Obtener una Feature por ID
@csrf_exempt
def feature_detail(request, id):
    feature = get_object_or_404(Feature, id=id)
    feature_data = {
        # "feature_type": feature.feature_type,
        "feature_id": feature.feature_id,
        "mag": feature.mag,
        "place": feature.place,
        "time": feature.time,
        "title": feature.title,
        "timefinal": feature.timefinal,
        # "geometry_type": feature.geometry_type,
        # "coordinates": feature.coordinates,
    }
    return JsonResponse(feature_data)

@csrf_exempt
def feature_update(request, id):
    if request.method == 'POST':
        # Obtener los datos enviados
        feature_id = request.POST.get('feature_id')
        feature_title = request.POST.get('title')
        feature_mag = request.POST.get('mag')
        feature_place = request.POST.get('place')
        feature_time = request.POST.get('time')
        feature_time_final = request.POST.get('timefinal')

        try:
            feature = Feature.objects.get(id=id)
            feature.feature_id = feature_id
            feature.title = feature_title
            feature.mag = feature_mag
            feature.place = feature_place
            feature.time = feature_time
            feature.timefinal = feature_time_final
            feature.save()
            return JsonResponse({'success': True})
        except Feature.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Feature no encontrado.'})

    return JsonResponse({'success': False, 'error': 'Método no soportado.'})

@csrf_exempt
def feature_delete(request, id):
    feature = get_object_or_404(Feature, id=id)
    feature.delete()
    return JsonResponse({"success": True})