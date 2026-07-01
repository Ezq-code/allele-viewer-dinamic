from unittest.mock import patch
from unittest.mock import MagicMock

import pytest
import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient

from apps.business_app.models.gene import Gene
from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles
from apps.genes_to_excel.serializers.genes_to_excel_files import (
    GenesToExcelFilesSerializer,
)
from apps.genes_to_excel.utils.xslx_reader import XslxReader
from apps.users_app.models.system_user import SystemUser


@pytest.mark.django_db
def test_genes_to_excel_save_dispatches_celery_task_on_create(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    user = SystemUser.objects.create_user(username="u_create", password="secret")
    upload = SimpleUploadedFile(
        "genes.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.genes_to_excel.models.genes_to_excel_files.process_genes_to_excel_file_task.delay"
    ) as mocked_delay:
        instance = GenesToExcelFiles.objects.create(
            custom_name="test file",
            file=upload,
            system_user=user,
        )

    mocked_delay.assert_called_once_with(instance.file.path, instance.id)


@pytest.mark.django_db
def test_genes_to_excel_save_does_not_dispatch_task_on_update(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    user = SystemUser.objects.create_user(username="u_update", password="secret")
    upload = SimpleUploadedFile(
        "genes.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.genes_to_excel.models.genes_to_excel_files.process_genes_to_excel_file_task.delay"
    ) as mocked_delay:
        instance = GenesToExcelFiles.objects.create(
            custom_name="initial",
            file=upload,
            system_user=user,
        )
        mocked_delay.reset_mock()

        instance.custom_name = "updated"
        instance.save()

    mocked_delay.assert_not_called()


@pytest.mark.django_db
def test_genes_to_excel_files_serializer_exposes_expected_fields():
    user = SystemUser.objects.create_user(username="serializer_user", password="secret")
    gene = Gene.objects.create(name="BRCA1")
    instance = GenesToExcelFiles(
        custom_name="uploaded file",
        description="test description",
        system_user=user,
        gene=gene,
    )

    serializer = GenesToExcelFilesSerializer(instance)

    assert "id" in serializer.data
    assert "custom_name" in serializer.data
    assert "description" in serializer.data
    assert "file" in serializer.data
    assert "system_user" in serializer.data
    assert "gene" in serializer.data
    assert "created_at" in serializer.data


@pytest.mark.django_db
def test_genes_to_excel_files_viewset_lists_files(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    user = SystemUser.objects.create_user(username="viewset_user", password="secret")
    gene = Gene.objects.create(name="TP53")
    upload = SimpleUploadedFile(
        "genes.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.genes_to_excel.models.genes_to_excel_files.process_genes_to_excel_file_task.delay"
    ):
        created = GenesToExcelFiles.objects.create(
            custom_name="viewset file",
            file=upload,
            system_user=user,
            gene=gene,
        )

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("genes-to-excel-files-list"))

    assert response.status_code == 200
    assert response.data["results"][0]["id"] == created.id
    assert response.data["results"][0]["custom_name"] == "viewset file"


@pytest.mark.django_db
def test_genes_to_excel_files_viewset_creates_file_and_dispatches_task(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    user = SystemUser.objects.create_user(username="creator_user", password="secret")
    gene = Gene.objects.create(name="EGFR")
    upload = SimpleUploadedFile(
        "genes.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    client = APIClient()
    client.force_authenticate(user=user)

    with patch(
        "apps.genes_to_excel.models.genes_to_excel_files.process_genes_to_excel_file_task.delay"
    ) as mocked_delay:
        response = client.post(
            reverse("genes-to-excel-files-list"),
            {
                "custom_name": "created from api",
                "description": "api upload",
                "file": upload,
                "system_user": user.id,
                "gene": gene.id,
            },
            format="multipart",
        )

    assert response.status_code == 201
    assert mocked_delay.call_count == 1


def test_xslx_reader_loads_dataframe_and_validates_required_columns():
    frame = pd.DataFrame(
        {
            "Gene": ["TP53"],
            "Cord": ["1"],
            "Valor": ["v"],
            "Color": ["c"],
            "Protein": ["p"],
            "Alleleasoc": ["a"],
            "Species": ["s"],
            "Variant": ["var"],
            "Order1": ["1"],
            "Order2": ["2"],
            "Order3": ["3"],
            "NCBI_Link": ["link"],
        }
    )
    mocked_excel = MagicMock()
    mocked_excel.sheet_names = ["Sheet1"]

    with patch("apps.genes_to_excel.utils.xslx_reader.pd.ExcelFile", return_value=mocked_excel), patch(
        "apps.genes_to_excel.utils.xslx_reader.pd.read_excel",
        return_value=frame,
    ):
        reader = XslxReader("dummy.xlsx")

    assert reader.df.equals(frame)


def test_xslx_reader_raises_when_required_columns_are_missing():
    frame = pd.DataFrame({"Gene": ["TP53"], "Cord": ["1"]})
    mocked_excel = MagicMock()
    mocked_excel.sheet_names = ["Sheet1"]

    with patch("apps.genes_to_excel.utils.xslx_reader.pd.ExcelFile", return_value=mocked_excel), patch(
        "apps.genes_to_excel.utils.xslx_reader.pd.read_excel",
        return_value=frame,
    ):
        with pytest.raises(ValueError, match="The file must contains the needed columns"):
            XslxReader("dummy.xlsx")
