# Generated by Django 5.0.6 on 2025-01-15 05:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0048_merge_20250101_1719"),
        ("users_app", "0014_merge_20240905_0947"),
    ]

    operations = [
        migrations.AddField(
            model_name="siteconfiguration",
            name="upload_to_drive",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="regioncountry",
            name="country",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="region_country",
                to="users_app.country",
            ),
        ),
    ]
