# Generated by Django 4.2.1 on 2024-05-10 14:12

import apps.business_app.models.custom_generated_pdb_files
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("users_app", "0010_alter_systemuser_phone"),
        ("business_app", "0021_alter_pdbfiles_options_initialfiledata_row_index"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomGeneratedPdbFiles",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "custom_name",
                    models.CharField(max_length=150, verbose_name="custom name"),
                ),
                (
                    "description",
                    models.TextField(
                        blank=True,
                        default="Created due to user custom input.",
                        max_length=150,
                        null=True,
                        verbose_name="description",
                    ),
                ),
                (
                    "file",
                    models.FileField(
                        upload_to=apps.business_app.models.uploaded_files.user_processed_directory_path,
                        verbose_name="Processed File",
                    ),
                ),
                (
                    "original_file",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="custom_generated_pdb_files",
                        to="business_app.uploadedfiles",
                        verbose_name="Original File",
                    ),
                ),
                (
                    "system_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="custom_generated_pdb_files",
                        to="users_app.systemuser",
                    ),
                ),
            ],
            options={
                "verbose_name": "Custom PDB File",
                "verbose_name_plural": "Custom PDB Files",
            },
        ),
    ]