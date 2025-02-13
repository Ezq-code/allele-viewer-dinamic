from django.shortcuts import render
from apps.business_app.models import Event, Feature, Marker, MarkerGallery
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
def mapgeneral(request):
    return render(request, "map/mapgeneral.html")


@cache_page(60 * 15)
def events(request):
    events = Event.objects.order_by("-id").all()
    return render(request, "map/event/events.html", {"events": events})


@cache_page(60 * 15)
def human_migrations(request):
    migrations = Feature.objects.filter(geometry_type="Point").order_by("-id").all()
    return render(request, "map/migrations/migrations.html", {"migrations": migrations})


@cache_page(60 * 15)
def markers_list(request):
    markers = Marker.objects.order_by("-id").all()
    return render(request, "map/markers/markers.html", {"markers": markers})


@cache_page(60 * 15)
def register(request):
    return render(request, "login/register.html")


@cache_page(60 * 15)
def marker_gallery(request):
    gallery = MarkerGallery.objects.order_by("-id").all()
    markers = Marker.objects.order_by("-id").all()
    return render(
        request,
        "map/marker_gallery/marker_gallery.html",
        {"gallery": gallery, "markers": markers},
    )
