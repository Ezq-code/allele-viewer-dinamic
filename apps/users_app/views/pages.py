from django.shortcuts import render
from apps.business_app.models import Event, Feature, Marker

# Create your views here.


def index(request):
    return render(request, "index.html")


def usuarios(request):
    return render(request, "user/usuarios.html")


def first_login(request):
    return render(request, "login/login.html")


def alleleviewer(request):
    return render(request, "grafico/alleleviewer.html")


def uploadfile(request):
    return render(request, "grafico/uploadfile.html")


def mapgeneral(request):
    return render(request, "map/mapgeneral.html")


def events(request):
    events = Event.objects.order_by("-id").all()
    return render(request, "map/event/events.html", {"events": events})


def human_migrations(request):
    migrations = Feature.objects.filter(geometry_type="Point").order_by("-id").all()
    return render(request, "map/migrations/migrations.html", {"migrations": migrations})


def markers_list(request):
    markers = Marker.objects.order_by("-id").all()
    return render(request, "map/markers/markers.html", {"markers": markers})


def register(request):
    return render(request, "login/register.html")
