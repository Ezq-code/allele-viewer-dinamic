# Generated by Django 4.2.1 on 2023-08-11 06:26

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AllowedExtensions",
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
                    "extension",
                    models.CharField(max_length=5, verbose_name="file extension"),
                ),
                (
                    "typical_app_name",
                    models.CharField(max_length=150, verbose_name="Application"),
                ),
            ],
            options={
                "verbose_name": "Allowed extension",
                "verbose_name_plural": "allowed Extensions",
            },
        ),
        migrations.CreateModel(
            name="SiteConfiguration",
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
                    "viewer_representation_mode",
                    models.CharField(
                        max_length=150, verbose_name="Viewer Representation mode"
                    ),
                ),
            ],
            options={
                "verbose_name": "Site Configuration",
            },
        ),
    ]
