# Generated by Django 4.2.7 on 2024-07-22 05:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0029_uploadedfiles_created_at_workingcopyoforiginalfile"),
    ]

    operations = [
        migrations.AlterField(
            model_name="workingcopyoforiginalfile",
            name="pdb_file_copy",
            field=models.CharField(
                blank=True, default=None, max_length=250, null=True, unique=True
            ),
        ),
    ]
