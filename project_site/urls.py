"""project_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from apps.users_app.views import pages

# ...

urlpatterns = [
    # YOUR PATTERNS
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("user-gestion/", include("apps.users_app.urls")),
    path("business-gestion/", include("apps.business_app.urls")),
    path("allele-formation/", include("apps.allele_formation.urls")),
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("__debug__/", include("debug_toolbar.urls")),
    path("usuarios/", login_required(pages.usuarios), name="usuarios"),
    path("population/", pages.population, name="population"),
    path("alleleviewer/", pages.alleleviewer, name="alleleviewer"),
    path(
        "uploadfile/",
        login_required(pages.uploadfile, login_url="/login/"),
        name="uploadfile",
    ),
    path(
        "uploadfileconformation/",
        login_required(pages.uploadfileconformation, login_url="/login/"),
        name="uploadfileconformation",
    ),
    path(
        "gene/",
        login_required(pages.gene, login_url="/login/"),
        name="gene",
    ),
    path(
        "disease-subgroup/",
        login_required(pages.disease_subgroup, login_url="/login/"),
        name="disease-subgroup",
    ),
    path(
        "disease-group/",
        login_required(pages.disease_group, login_url="/login/"),
        name="disease-group",
    ),
    path(
        "disorder/",
        login_required(pages.disorder, login_url="/login/"),
        name="disorder",
    ),
    path("ancestral", pages.ancestral, name="ancestral"),
    path("alleleviewer", pages.alleleviewer, name="alleleviewer"),
    path("login/", pages.first_login, name="first_login"),
    path("", pages.introduction, name="introducction"),
    path("register/", pages.register, name="register"),
    path("index/", pages.index, name="index"),
    path("mapgeneral/", pages.mapgeneral, name="mapgeneral"),
    path("event-type/list", pages.events_types, name="events-type"),
    path("events/list", pages.events, name="events-list"),
    path("features/list", pages.human_migrations, name="features"),
    path("markers/list", pages.markers_list, name="markers-list"),
    path("events-gallery/list", pages.event_gallery, name="events-gallery-list"),
    # Mis urls
    path('genes_to_excel/', include('apps.genes_to_excel.urls')),
]



# This is for serving media on development stages
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
