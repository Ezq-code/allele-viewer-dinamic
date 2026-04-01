from unittest.mock import patch
from types import SimpleNamespace

import pytest
import networkx as nx
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache

from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.allowed_extensions import AllowedExtensions
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.uploaded_files import UploadedFilesSerializer
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
        "apps.business_app.serializers.allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_delay.assert_called_once_with(obj.uploaded_file_id)
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
        "apps.business_app.serializers.allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == {1, 2}
    mocked_delay.assert_not_called()


def test_uploaded_files_serializer_list_action_returns_cached_allele_nodes():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="list")}
    )
    obj = SimpleNamespace(id=1)
    cache_key = UploadedFiles.CACHE_KEY_RELATED_ALLELE_NODES.format(
        uploaded_file_id=obj.id
    )
    cache.set(cache_key, [], timeout=None)

    with patch(
        "apps.business_app.serializers.uploaded_files.AlleleNodeSerializer"
    ) as mocked_allele_node_serializer:
        result = serializer.get_allele_nodes(obj)

    assert result == []
    mocked_allele_node_serializer.assert_not_called()


def test_uploaded_files_serializer_create_action_returns_cached_allele_nodes():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="create")}
    )
    obj = SimpleNamespace(id=2)
    cache_key = UploadedFiles.CACHE_KEY_RELATED_ALLELE_NODES.format(
        uploaded_file_id=obj.id
    )
    cache.set(cache_key, [], timeout=None)

    with patch(
        "apps.business_app.serializers.uploaded_files.AlleleNodeSerializer"
    ) as mocked_allele_node_serializer:
        result = serializer.get_allele_nodes(obj)

    assert result == []
    mocked_allele_node_serializer.assert_not_called()
