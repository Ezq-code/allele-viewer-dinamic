from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.business_app.models import Event, Marker
from django.core.exceptions import ObjectDoesNotExist


# Listar los eventos
@csrf_exempt
def list_events(request):
    events = Event.objects.all()
    data = [
        {
            "id": event.id,
            "event_name": event.event_name,
            "event_icon": event.event_icon.url,
        }
        for event in events
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def get_event_data_by_id(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        data = {
            "id": event.id,
            "event_name": event.event_name,
            "event_icon": event.event_icon.url,
        }
        return JsonResponse(data)
    except Event.DoesNotExist:
        return JsonResponse({"error": "El evento no existe"}, status=404)


# Crear evento
@csrf_exempt
def create_event(request):
    if request.method == "POST":
        event_name = request.POST.get("event_name")
        event_icon = request.FILES.get("event_icon")
        new_event = Event(event_name=event_name, event_icon=event_icon)
        new_event.save()
        return JsonResponse({"message": "Event created successfully"})
    return JsonResponse({"message": "Method not allowed"}, status=405)


# Editar evento
@csrf_exempt
def edit_event(request, event_id):
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return JsonResponse({"message": "Event not found"}, status=404)

    if request.method == "POST":
        try:
            event_name = request.POST["event_name"]
            event.event_name = event_name
            # Comprobar si se ha subido una nueva imagen
            if "event_icon" in request.FILES:
                event.event_icon = request.FILES["event_icon"]
            event.save()
            return JsonResponse({"message": "Event updated successfully"})
        except KeyError as e:
            return JsonResponse(
                {"error": f"Missing field: {e}"}, status=400
            )  # Error 400 Bad Request
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


# Eliminar evento
@csrf_exempt
def delete_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return JsonResponse({"message": "Event not found"}, status=404)

    event.delete()
    return JsonResponse({"message": "Event deleted successfully"})


@csrf_exempt
def list_markers(request):
    markers = Marker.objects.all()
    data = []
    for marker in markers:
        event_data = {
            "event_id": marker.event_type.id,
            "event_name": marker.event_type.event_name,
            "event_icon_url": marker.event_type.event_icon.url,
        }
        marker_data = {
            "id": marker.id,
            "latitude": marker.latitude,
            "longitude": marker.longitude,
            "start_date": marker.start_date,
            "end_date": marker.end_date,
            "start_format": marker.get_start_format_display(),
            "end_format": marker.get_end_format_display(),
            "description": marker.description,
            "reference": marker.reference,
            "event_type": event_data,
        }
        data.append(marker_data)

    return JsonResponse(data, safe=False)


@csrf_exempt
def create_marker(request):
    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")
        start_format = request.POST.get("start_format")
        end_format = request.POST.get("end_format")
        description = request.POST.get("description")
        reference = request.POST.get("reference")
        event_type_id = request.POST.get("event_type")
        try:
            existing_marker = Marker.objects.get(description=description)
            return JsonResponse(
                {"message": "Marker with this description already exists"}, status=400
            )
        except ObjectDoesNotExist:
            marker = Marker(
                latitude=latitude,
                longitude=longitude,
                start_date=start_date,
                end_date=end_date,
                start_format=start_format,
                end_format=end_format,
                description=description,
                reference=reference,
                event_type_id=event_type_id,
            )
            marker.save()
            return JsonResponse({"message": "Marker created successfully"})
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def edit_marker(request, marker_id):
    try:
        marker = Marker.objects.get(id=marker_id)
    except Marker.DoesNotExist:
        return JsonResponse({"message": "Marker not found"}, status=404)
    if request.method == "POST":
        marker.latitude = request.POST.get("latitude")
        marker.longitude = request.POST.get("longitude")
        marker.start_date = request.POST.get("start_date")
        marker.end_date = request.POST.get("end_date")
        marker.start_format = request.POST.get("start_format")
        marker.end_format = request.POST.get("end_format")
        marker.description = request.POST.get("description")
        marker.reference = request.POST.get("reference")
        marker.event_type_id = request.POST.get("event_type")
        marker.save()
        return JsonResponse({"message": "Marker updated successfully"})
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def delete_marker(request, marker_id):
    try:
        marker = Marker.objects.get(id=marker_id)
    except Marker.DoesNotExist:
        return JsonResponse({"message": "Marker not found"}, status=404)
    marker.delete()
    return JsonResponse({"message": "Marker deleted successfully"})


@csrf_exempt
def get_marker_by_description(request):
    if request.method == "POST":
        description = request.POST.get("description")
        try:
            marker = Marker.objects.get(description=description)
            data = {
                "id": str(marker.id),
                "latitude": marker.latitude,
                "longitude": marker.longitude,
                "start_date": marker.start_date,
                "end_date": marker.end_date,
                "start_format": marker.start_format,
                "end_format": marker.end_format,
                "reference": marker.reference,
                "event_type_id": marker.event_type_id,
            }
            return JsonResponse(data)
        except ObjectDoesNotExist:
            return JsonResponse(
                {"message": "Marker with this description does not exist"}, status=404
            )
    return JsonResponse({"message": "Method not allowed"}, status=405)
