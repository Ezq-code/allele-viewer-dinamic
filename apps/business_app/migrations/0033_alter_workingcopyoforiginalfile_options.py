# Generated by Django 5.0.6 on 2024-07-26 03:47

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0032_alter_workingcopyoforiginalfile_pdb_file_copy"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="workingcopyoforiginalfile",
            options={
                "verbose_name": "Uploaded File Copy",
                "verbose_name_plural": "Uploaded Files Copies",
            },
        ),
    ]