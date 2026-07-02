# from rest_framework import routers

# from rest_framework_extensions.routers import ExtendedSimpleRouter

from rest_framework_extensions.routers import ExtendedSimpleRouter

from apps.genes_to_excel.views.genes_to_excel_files import GenesToExcelFilesViewSet
from apps.genes_to_excel.views.caracteristica_gen import CaracteristicaGenViewSet

router = ExtendedSimpleRouter()

# uploaded_files_router = router.register("uploaded-files",UploadedFilesViewSet, basename="uploaded-files",)
router.register(
    "caracteristica-gen", CaracteristicaGenViewSet, basename="caracteristica-gen"
)
# router.register("coordenadas-gen", CoordenadasGenViewSet, basename="coordenadas-gen")
router.register(
    "genes-to-excel-files",
    GenesToExcelFilesViewSet,
    basename="genes-to-excel-files",
)
urlpatterns = []
urlpatterns += router.urls
