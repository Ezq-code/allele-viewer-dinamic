# Generated by Django 5.0.6 on 2025-01-15 06:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0049_siteconfiguration_upload_to_drive_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="allelenode",
            name="rs",
            field=models.TextField(verbose_name="RS"),
        ),
    ]
