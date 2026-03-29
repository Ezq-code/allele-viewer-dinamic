from unittest.mock import patch
from types import SimpleNamespace

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache

from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.allowed_extensions import AllowedExtensions
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
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
		"apps.business_app.models.uploaded_files.process_uploaded_file_task.delay"
	) as mocked_delay:
		instance = UploadedFiles.objects.create(
			custom_name="my file",
			original_file=upload,
			system_user=user,
		)

	mocked_delay.assert_called_once_with(instance.id)


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
		"apps.business_app.models.uploaded_files.process_uploaded_file_task.delay"
	) as mocked_delay:
		instance = UploadedFiles.objects.create(
			custom_name="original",
			original_file=upload,
			system_user=user,
		)
		mocked_delay.reset_mock()

		instance.custom_name = "updated"
		instance.save()

	mocked_delay.assert_not_called()


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
		"apps.business_app.models.uploaded_files.process_uploaded_file_task.delay"
	) as mocked_delay:
		UploadedFiles.objects.create(
			custom_name="pdb file",
			original_file=upload,
			system_user=user,
		)

	mocked_delay.assert_not_called()


def test_allele_node_serializer_enqueues_task_when_graph_cache_miss():
	serializer = AlleleNodeSerializer()
	obj = SimpleNamespace(uploaded_file_id=999, number=10)

	graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_FILE.format(uploaded_file_id=obj.uploaded_file_id)
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
	class FakeGraph:
		def predecessors(self, node):
			if node == 2:
				return [1]
			return []

	serializer = AlleleNodeSerializer()
	obj = SimpleNamespace(uploaded_file_id=1001, number=2)

	graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_FILE.format(uploaded_file_id=obj.uploaded_file_id)
	cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
		uploaded_file_id=obj.uploaded_file_id,
		number=obj.number,
	)
	cache.set(graph_key, FakeGraph(), timeout=None)
	cache.delete(cache_key)

	with patch(
		"apps.business_app.serializers.allele_nodes.build_uploaded_file_graph_cache_task.delay"
	) as mocked_delay:
		result = serializer.get_predecessors(obj)

	assert result == {1, 2}
	mocked_delay.assert_not_called()
