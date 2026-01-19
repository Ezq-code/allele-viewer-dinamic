# from rest_framework import routers
<<<<<<< HEAD
#from rest_framework_extensions.routers import ExtendedSimpleRouter
from rest_framework.routers import DefaultRouter
from django.urls import path
=======
from rest_framework_extensions.routers import ExtendedSimpleRouter
>>>>>>> 26707ad4a71e600bfc27539a09eae8e30e6829c1

from apps.genes_to_excel.views import (
    UploadedFilesViewSet,
)


<<<<<<< HEAD
router = DefaultRouter() #ExtendedSimpleRouter()

#uploaded_files_router = router.register(
#    "uploaded-files",
#    UploadedFilesViewSet,
#    basename="uploaded-files",
#)
=======
router = ExtendedSimpleRouter()

uploaded_files_router = router.register(
    "uploaded-files",
    UploadedFilesViewSet,
    basename="uploaded-files",
)
>>>>>>> 26707ad4a71e600bfc27539a09eae8e30e6829c1


urlpatterns = []

urlpatterns += router.urls
