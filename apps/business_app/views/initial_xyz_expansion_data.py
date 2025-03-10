from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets, status, mixins
from drf_spectacular.utils import extend_schema


from apps.business_app.models.initial_xyz_expansion_data import InitialXyzExpansionData
from apps.business_app.serializers.custom_generated_pdb_files import (
    CustomGeneratedPdbFilesSerializer,
)
from apps.business_app.serializers.initial_xyz_expansion_data import (
    InitialXyzExpansionDataSerializer,
)
from apps.business_app.utils.google_sheet_coordinate_processor import (
    GoogleSheetCoordinateProcessor,
)
from rest_framework.response import Response
from google.auth.exceptions import RefreshError


# Create your views here.


class InitialXyzExpansionDataViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that allows file upload extensions added or edited.
    """

    queryset = InitialXyzExpansionData.objects.all()
    serializer_class = InitialXyzExpansionDataSerializer
    filterset_fields = ["uploaded_file"]
    filter_backends = [
        DjangoFilterBackend,
    ]
    lookup_field = "uploaded_file"

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        methods=["POST"],
        description="Proccess incoming xyz expansion factors and generate a new set of coordinates",
        responses={200: CustomGeneratedPdbFilesSerializer},
    )
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            processor = GoogleSheetCoordinateProcessor(
                serializer.validated_data.get("uploaded_file"), request.user
            )
            if processor.proccess_expansion_input(
                serializer.validated_data.get("x_value"),
                serializer.validated_data.get("y_value"),
                serializer.validated_data.get("z_value"),
            ):
                custom_generated_pdb_file = processor.get_output()
                output_serializer = CustomGeneratedPdbFilesSerializer(
                    custom_generated_pdb_file
                )
                return Response(output_serializer.data)
        except RefreshError as e:
            print(e)
            return Response(
                data={"detail": f"Error accessing the Google Sheet API: {e}"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            print(e)
            return Response(
                data={
                    "detail": f"An error occurred during the processing of the data: {e}."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
