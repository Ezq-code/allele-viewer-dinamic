# Generated by Django 4.2.1 on 2023-08-18 03:10

from django.db import migrations, transaction


@transaction.atomic
def create_allowed_extensions(apps, schema_editor):
    AllowedExtensions = apps.get_model("business_app", "AllowedExtensions")
    AllowedExtensions.objects.all().delete()

    AllowedExtensions.objects.bulk_create(
        [
            AllowedExtensions(extension=".xlsx", typical_app_name="Microsoft Excel"),
            AllowedExtensions(
                extension=".xls", typical_app_name="2003 Microsoft Excel"
            ),
            AllowedExtensions(extension=".pdb", typical_app_name="PDB file"),
        ]
    )


def remove_allowed_extensions(apps, schema_editor):
    AllowedExtensions = apps.get_model("business_app", "AllowedExtensions")
    AllowedExtensions.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0005_alter_uploadedfiles_processed_file_and_more"),
    ]

    operations = [
        migrations.RunPython(create_allowed_extensions, remove_allowed_extensions),
    ]