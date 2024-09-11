from drf_spectacular.utils import extend_schema
from google.auth.exceptions import RefreshError
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from rest_framework_extensions.mixins import NestedViewSetMixin

from apps.business_app.serializers.custom_generated_pdb_files import (
    CustomGeneratedPdbFilesSerializer,
)
from apps.business_app.serializers.new_snp_coordinate_processor import (
    SnpCoordinateProcessorInputSerializer,
)
from apps.business_app.serializers.new_xyz_coordinate_processor import (
    XyzCoordinateProcessorInputSerializer,
)
from apps.business_app.utils.google_sheet_coordinate_processor import (
    GoogleSheetCoordinateProcessor,
)


# Create your views here.
class NewCoordinatesProcessorViewSet(NestedViewSetMixin, viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        request=SnpCoordinateProcessorInputSerializer,
        methods=["POST"],
        description="Proccess incoming numbers and generate a new set of coordinates",
        responses={200: CustomGeneratedPdbFilesSerializer},
    )
    def create(self, request):
        serializer = SnpCoordinateProcessorInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            processor = GoogleSheetCoordinateProcessor(
                serializer.validated_data.get("file_id"), request.user
            )
            if processor.proccess_snp_input(
                serializer.validated_data.get("values"),
            ):
                custom_generated_pdb_file = processor.get_output()
                output_serializer = CustomGeneratedPdbFilesSerializer(
                    custom_generated_pdb_file
                )
                return Response(output_serializer.data)
        except RefreshError as e:
            print(e)
            return Response(
                data={"detail": f"Error accessing Google Sheet API: {e}"},
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

    @extend_schema(
        request=XyzCoordinateProcessorInputSerializer,
        methods=["POST"],
        description="Proccess incoming expansions coeficients and output new pdb file",
        responses={200: CustomGeneratedPdbFilesSerializer},
    )
    @action(
        methods=["post"],
        detail=False,
        url_name="expansion-processor",
        url_path="expansion-processor",
        permission_classes=[permissions.IsAuthenticated],
    )
    def expansion_processor(self, request):
        serializer = XyzCoordinateProcessorInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            processor = GoogleSheetCoordinateProcessor(
                serializer.validated_data.get("file_id"), request.user
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
