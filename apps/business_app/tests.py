from unittest.mock import patch
from types import SimpleNamespace

import pytest
import networkx as nx
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.base_allele_node import BaseAlleleNode
from apps.business_app.models.allowed_extensions import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.models.protein_node import ProteinNode
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.protein_nodes import ProteinNodeSerializer
from apps.business_app.serializers.uploaded_files import UploadedFilesSerializer
from apps.business_app.utils.gene_list_cache import (
    GENE_LIST_VERSION_KEY,
    get_gene_list_cache_version,
)
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
    obj = SimpleNamespace(uploaded_file_id=999, number=10)

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_FILE.format(
        uploaded_file_id=obj.uploaded_file_id
    )
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        uploaded_file_id=obj.uploaded_file_id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.uploaded_file_id)
    assert cache.get(cache_key) is None


def test_allele_node_serializer_uses_cached_graph_without_enqueuing_task():
    serializer = AlleleNodeSerializer()
    obj = SimpleNamespace(uploaded_file_id=1001, number=2)
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_FILE.format(
        uploaded_file_id=obj.uploaded_file_id
    )
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        uploaded_file_id=obj.uploaded_file_id,
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
    
    # Both models have the uploaded_file FK (defined in their concrete implementations)
    allele_fields = {field.name for field in AlleleNode._meta.local_fields}
    assert "uploaded_file" in allele_fields
    assert "uploaded_file" in protein_fields


def test_protein_node_serializer_enqueues_task_when_graph_cache_miss():
    """Test that ProteinNodeSerializer requests graph cache task on cache miss."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(uploaded_file_id=999, number=10)

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_FILE.format(
        uploaded_file_id=obj.uploaded_file_id
    )
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        uploaded_file_id=obj.uploaded_file_id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.uploaded_file_id)
    assert cache.get(cache_key) is None


def test_protein_node_serializer_uses_cached_graph_without_enqueuing_task():
    """Test that ProteinNodeSerializer uses cached graph without requesting new computation."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(uploaded_file_id=1001, number=2)
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_FILE.format(
        uploaded_file_id=obj.uploaded_file_id
    )
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        uploaded_file_id=obj.uploaded_file_id,
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
