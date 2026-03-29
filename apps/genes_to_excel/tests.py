from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.genes_to_excel.models.genes_to_excel_files import GenesToExcelFiles
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
