from unittest.mock import patch
from types import SimpleNamespace

import pytest
import networkx as nx
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient
from apps.common.utils.pusher_client import PusherClient


from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.base_allele_node import BaseAlleleNode
from apps.business_app.models.allowed_extensions import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.models.protein_node import ProteinNode
from apps.business_app.models.study import Study
from apps.business_app.models.study_type import StudyType
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.protein_nodes import ProteinNodeSerializer
from apps.business_app.serializers.study import StudySerializer
from apps.business_app.serializers.uploaded_files import UploadedFilesSerializer
from apps.business_app.utils.gene_list_cache import (
    GENE_LIST_VERSION_KEY,
    get_gene_list_cache_version,
)
from apps.business_app.tasks import process_uploaded_file_task
from apps.users_app.models.system_user import SystemUser


@pytest.mark.django_db
def test_uploaded_files_save_dispatches_celery_task_on_create(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="uploaded_create", password="secret")
    upload = SimpleUploadedFile(
        "source.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ) as mocked_apply_async:
        instance = UploadedFiles.objects.create(
            custom_name="my file",
            original_file=upload,
            system_user=user,
        )

    mocked_apply_async.assert_called_once_with(args=[instance.id], retry=False)


@pytest.mark.django_db
def test_uploaded_files_save_does_not_dispatch_task_on_update(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="uploaded_update", password="secret")
    upload = SimpleUploadedFile(
        "source.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ) as mocked_apply_async:
        instance = UploadedFiles.objects.create(
            custom_name="original",
            original_file=upload,
            system_user=user,
        )
        mocked_apply_async.reset_mock()

        instance.custom_name = "updated"
        instance.save()

    mocked_apply_async.assert_not_called()


@pytest.mark.django_db
def test_uploaded_files_save_does_not_dispatch_task_for_pdb(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".pdb", typical_app_name="PDB")
    user = SystemUser.objects.create_user(username="uploaded_pdb", password="secret")
    upload = SimpleUploadedFile(
        "source.pdb",
        b"ATOM      1  N   ASN A   1      38.428  13.947  24.947",
        content_type="chemical/x-pdb",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ) as mocked_apply_async:
        UploadedFiles.objects.create(
            custom_name="pdb file",
            original_file=upload,
            system_user=user,
        )

    mocked_apply_async.assert_not_called()


def test_allele_node_serializer_enqueues_task_when_graph_cache_miss():
    serializer = AlleleNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=999), number=10)
    obj.study_id = 999

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.study.id)
    assert cache.get(cache_key) is None


def test_allele_node_serializer_uses_cached_graph_without_enqueuing_task():
    serializer = AlleleNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=1001), number=2)
    obj.study_id = 1001
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.set(graph_key, graph, timeout=None)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == {1, 2}
    mocked_delay.assert_not_called()


def test_uploaded_files_serializer_exposes_allele_nodes_field():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="list")}
    )
    assert "allele_nodes" in serializer.fields


def test_uploaded_files_serializer_does_not_implement_get_allele_nodes_method():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="create")}
    )
    assert not hasattr(serializer, "get_allele_nodes")


@pytest.mark.django_db
def test_study_serializer_exposes_study_type_display(tmp_path, settings):
    """study_type_display debe ser el nombre del StudyType relacionado."""
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(
        username="study_serializer", password="secret"
    )
    upload = SimpleUploadedFile(
        "study_serializer.xlsx",
        b"serializer-file",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Study Upload",
            original_file=upload,
            system_user=user,
        )
    study_type = StudyType.objects.create(name="Location", sheet_name="Location Sheet")
    study = Study(
        uploaded_file=uploaded_file,
        successfull_load=True,
        extra_info="Coordinates loaded",
    )
    study.study_type = study_type
    study.save()

    data = StudySerializer(study).data

    assert data["study_type_display"] == "Location"


@pytest.mark.django_db
def test_study_viewset_lists_studies_by_uploaded_file(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="study_list", password="secret")

    upload_one = SimpleUploadedFile(
        "study_one.xlsx",
        b"file-one",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    upload_two = SimpleUploadedFile(
        "study_two.xlsx",
        b"file-two",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ):
        uploaded_file_one = UploadedFiles.objects.create(
            custom_name="Upload One",
            original_file=upload_one,
            system_user=user,
        )
        uploaded_file_two = UploadedFiles.objects.create(
            custom_name="Upload Two",
            original_file=upload_two,
            system_user=user,
        )

    study_type_location = StudyType.objects.create(
        name="Location", sheet_name="Location Sheet"
    )
    study_type_ancestors = StudyType.objects.create(
        name="Ancestors", sheet_name="Ancestors Sheet"
    )

    Study.objects.create(
        uploaded_file=uploaded_file_one,
        study_type=study_type_location,
        successfull_load=True,
        extra_info="Included",
    )
    Study.objects.create(
        uploaded_file=uploaded_file_two,
        study_type=study_type_ancestors,
        successfull_load=False,
        extra_info="Excluded",
    )

    client = APIClient()
    response = client.get(
        reverse(
            "study-by-uploaded-file-list",
            kwargs={"parent_lookup_uploaded_file": uploaded_file_one.id},
        )
    )

    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["uploaded_file"] == uploaded_file_one.id
    assert response.data["results"][0]["study_type_display"] == "Location"


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_gene_change():
    cache.clear()
    client = APIClient()
    GeneStatus.objects.create(
        name="Completeness", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache01", description="before")

    list_url = reverse("gene-list")
    first_response = client.get(list_url)
    assert first_response.status_code == 200
    assert any(row["id"] == gene.id for row in first_response.data["results"])

    version_before = get_gene_list_cache_version()
    gene.description = "after"
    gene.save(update_fields=["description"])
    version_after = get_gene_list_cache_version()

    assert version_after == version_before + 1

    second_response = client.get(list_url)
    assert second_response.status_code == 200
    row = next(
        item for item in second_response.data["results"] if item["id"] == gene.id
    )
    assert row["description"] == "after"


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_gene_status_middle_change():
    cache.clear()
    client = APIClient()
    status = GeneStatus.objects.create(
        name="Quality", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache02")
    gsm = GeneStatusMiddle.objects.get(gene=gene, gene_status=status)

    list_url = reverse("gene-list")
    first_response = client.get(list_url)
    assert first_response.status_code == 200

    version_before = get_gene_list_cache_version()
    gsm.value = 77
    gsm.save(update_fields=["value"])
    version_after = get_gene_list_cache_version()

    assert version_after == version_before + 1

    second_response = client.get(list_url)
    assert second_response.status_code == 200
    row = next(
        item for item in second_response.data["results"] if item["id"] == gene.id
    )
    assert row["status"] == 77


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_m2m_changes():
    cache.clear()
    GeneStatus.objects.create(
        name="Stability", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache03")
    baseline_version = get_gene_list_cache_version()

    # Using clear() triggers post_clear m2m signal even when relation is empty.
    gene.groups.clear()
    assert get_gene_list_cache_version() == baseline_version + 1

    baseline_version = get_gene_list_cache_version()
    gene.disorders.clear()
    assert get_gene_list_cache_version() == baseline_version + 1


@pytest.mark.django_db
def test_gene_list_cache_version_key_exists_after_first_read():
    cache.clear()
    GeneStatus.objects.create(
        name="Coverage", type=GeneStatus.TypeRepresentation.PERCENT
    )
    Gene.objects.create(name="GeneCache04")

    assert cache.get(GENE_LIST_VERSION_KEY) is not None


def test_node_models_share_abstract_base_for_dry_structure():
    assert issubclass(AlleleNode, BaseAlleleNode)
    assert issubclass(ProteinNode, BaseAlleleNode)


def test_dry_refactor_keeps_existing_concrete_model_fields():
    """Verify that AlleleNode and ProteinNode share abstract base structure."""
    # Both models inherit from the abstract base
    assert issubclass(AlleleNode, BaseAlleleNode)
    assert issubclass(ProteinNode, BaseAlleleNode)

    # ProteinNode has its own specific field
    protein_fields = {field.name for field in ProteinNode._meta.local_fields}
    assert "is_final_for_allele" in protein_fields

    # Both models have the study FK (defined in BaseAlleleNode)
    allele_fields = {field.name for field in AlleleNode._meta.local_fields}
    assert "study" in allele_fields
    assert "study" in protein_fields


def test_protein_node_serializer_enqueues_task_when_graph_cache_miss():
    """Test that ProteinNodeSerializer requests graph cache task on cache miss."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=999), number=10)
    obj.study_id = 999

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.study.id)
    assert cache.get(cache_key) is None


def test_protein_node_serializer_uses_cached_graph_without_enqueuing_task():
    """Test that ProteinNodeSerializer uses cached graph without requesting new computation."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=1001), number=2)
    obj.study_id = 1001
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study.id)
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.set(graph_key, graph, timeout=None)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == {1, 2}
    mocked_delay.assert_not_called()


@pytest.mark.django_db
def test_process_uploaded_file_task_sends_success_when_at_least_one_processor_succeeds(
    tmp_path, settings
):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(
        username="task_partial_success", password="secret"
    )
    upload = SimpleUploadedFile(
        "task_partial_success.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Task Partial Success",
            original_file=upload,
            system_user=user,
        )

    processor_ok = SimpleNamespace(
        proccess_pdb_file=lambda *_args, **_kwargs: None,
        study=SimpleNamespace(id=1),
    )

    with patch(
        "apps.business_app.tasks.SiteConfiguration.get_solo"
    ) as mocked_config, patch(
        "apps.business_app.tasks.send_pusher_trigger_task.delay"
    ) as mocked_pusher, patch(
        "apps.business_app.tasks.fill_predecessors_and_sucessors_for_all_nodes"
    ) as mocked_fill, patch(
        "apps.business_app.tasks.XslxToPdbByAlleleStudy"
    ) as mocked_processor_1, patch(
        "apps.business_app.tasks.XslxToPdbByAncestersPlusEstStudy"
    ) as mocked_processor_2, patch(
        "apps.business_app.tasks.XslxToPdbByAncestersMinusEstStudy"
    ) as mocked_processor_3, patch(
        "apps.business_app.tasks.XslxToPdbByLocationPlusEstStudy"
    ) as mocked_processor_4, patch(
        "apps.business_app.tasks.XslxToPdbByLocationMinusEstStudy"
    ) as mocked_processor_5:
        mocked_config.return_value = SimpleNamespace(upload_to_drive=False)

        mocked_processor_1.side_effect = RuntimeError("processor 1 failed")
        mocked_processor_2.return_value = processor_ok
        mocked_processor_3.side_effect = RuntimeError("processor 3 failed")
        mocked_processor_4.side_effect = RuntimeError("processor 4 failed")
        mocked_processor_5.side_effect = RuntimeError("processor 5 failed")

        result = process_uploaded_file_task.run(uploaded_file.id)

    uploaded_file.refresh_from_db()
    assert uploaded_file.processed is True
    assert result["status"] == "success"
    mocked_fill.assert_called_once_with(study_id=1)
    mocked_pusher.assert_called_once()
    kwargs = mocked_pusher.call_args.kwargs
    assert kwargs["event"] == PusherClient.SUCCESSFUL_UPLOAD_3D_EXCEL
    assert kwargs["data"] == {"uploaded_file_id": uploaded_file.id}


@pytest.mark.django_db
def test_process_uploaded_file_task_fails_when_all_processors_fail(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="task_all_fail", password="secret")
    upload = SimpleUploadedFile(
        "task_all_fail.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.process_uploaded_file_task.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Task All Fail",
            original_file=upload,
            system_user=user,
        )

    with patch(
        "apps.business_app.tasks.SiteConfiguration.get_solo"
    ) as mocked_config, patch(
        "apps.business_app.tasks.send_pusher_trigger_task.delay"
    ) as mocked_pusher, patch(
        "apps.business_app.tasks.XslxToPdbByAlleleStudy"
    ) as mocked_processor_1, patch(
        "apps.business_app.tasks.XslxToPdbByAncestersPlusEstStudy"
    ) as mocked_processor_2, patch(
        "apps.business_app.tasks.XslxToPdbByAncestersMinusEstStudy"
    ) as mocked_processor_3, patch(
        "apps.business_app.tasks.XslxToPdbByLocationPlusEstStudy"
    ) as mocked_processor_4, patch(
        "apps.business_app.tasks.XslxToPdbByLocationMinusEstStudy"
    ) as mocked_processor_5:
        mocked_config.return_value = SimpleNamespace(upload_to_drive=False)
        mocked_processor_1.side_effect = RuntimeError("processor 1 failed")
        mocked_processor_2.side_effect = RuntimeError("processor 2 failed")
        mocked_processor_3.side_effect = RuntimeError("processor 3 failed")
        mocked_processor_4.side_effect = RuntimeError("processor 4 failed")
        mocked_processor_5.side_effect = RuntimeError("processor 5 failed")

        with pytest.raises(RuntimeError):
            process_uploaded_file_task.run(uploaded_file.id)

    uploaded_file.refresh_from_db()
    assert uploaded_file.processed is False
    mocked_pusher.assert_called_once()
    kwargs = mocked_pusher.call_args.kwargs
    assert kwargs["event"] == PusherClient.FAILED_UPLOAD_3D_EXCEL
