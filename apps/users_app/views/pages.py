from django.shortcuts import render
from apps.business_app.models import Event, Feature, Marker, EventGallery, EventType
from django.views.decorators.cache import cache_page


# Create your views here.


@cache_page(60 * 15)
def index(request):
    return render(request, "index.html")


@cache_page(60 * 15)
def usuarios(request):
    return render(request, "user/usuarios.html")


@cache_page(60 * 15)
def population(request):
    return render(request, "population/population.html")


@cache_page(60 * 15)
def first_login(request):
    return render(request, "login/login.html")


@cache_page(60 * 15)
def alleleviewer(request):
    return render(request, "grafico/alleleviewer.html")


@cache_page(60 * 15)
def uploadfile(request):
    return render(request, "grafico/uploadfile.html")


@cache_page(60 * 15)
def register(request):
    return render(request, "login/register.html")


@cache_page(60 * 15)
def mapgeneral(request):
    return render(request, "map/mapgeneral.html")


@cache_page(60 * 15)
def human_migrations(request):
    migrations = Feature.objects.filter(geometry_type="Point").order_by("-id").all()
    return render(request, "map/migrations/migrations.html", {"migrations": migrations})


@cache_page(60 * 15)
def events(request):
    eventos = Event.objects.order_by("-id").all()
    events_type = EventType.objects.order_by("-id").all()
    return render(
        request,
        "map/events/events.html",
        {"eventos": eventos, "events_type": events_type})


@cache_page(60 * 15)
def events_types(request):
    events_type = EventType.objects.order_by("-id").all()
    return render(request, "map/event_type/event_type.html", {"events_type": events_type})


@cache_page(60 * 15)
def markers_list(request):
    markers = Marker.objects.order_by("-id").all()
    return render(request, "map/markers/markers.html", {"markers": markers})


@cache_page(60 * 15)
def event_gallery(request):
    gallery = EventGallery.objects.order_by("-id").all()
    event_all = Event.objects.order_by("-id").all()
    return render(
        request,
        "map/event_gallery/event_gallery.html",
        {"gallery": gallery, "event_all": event_all},
    )
