# Generated by Django 4.2.1 on 2024-03-07 04:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0019_allelenode_region"),
    ]

    operations = [
        migrations.CreateModel(
            name="InitialFileData",
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
                ("allele", models.CharField(max_length=150, verbose_name="Allele")),
                ("marker", models.CharField(max_length=150, verbose_name="Marker")),
                (
                    "original_value",
                    models.PositiveSmallIntegerField(verbose_name="Original Value"),
                ),
                (
                    "min_value",
                    models.PositiveSmallIntegerField(verbose_name="Min Value"),
                ),
                (
                    "max_value",
                    models.PositiveSmallIntegerField(verbose_name="Max Value"),
                ),
                (
                    "uploaded_file",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="initial_info",
                        to="business_app.uploadedfiles",
                    ),
                ),
            ],
            options={
                "verbose_name": "Initial File Data",
                "verbose_name_plural": "Initial File Data",
            },
        ),
    ]