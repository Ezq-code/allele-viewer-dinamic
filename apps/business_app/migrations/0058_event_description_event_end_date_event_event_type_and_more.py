# Generated by Django 5.0.6 on 2025-02-22 05:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0057_eventtype"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="description",
            field=models.TextField(
                blank=True, null=True, verbose_name="Event Description"
            ),
        ),
        migrations.AddField(
            model_name="event",
            name="end_date",
            field=models.IntegerField(default=1, verbose_name="End Date"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="event",
            name="event_type",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="business_app.eventtype",
                verbose_name="Event Type",
            ),
        ),
        migrations.AddField(
            model_name="event",
            name="reference",
            field=models.TextField(blank=True, null=True, verbose_name="Reference"),
        ),
        migrations.AddField(
            model_name="event",
            name="start_date",
            field=models.IntegerField(default=1, verbose_name="Start Date"),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="event",
            name="event_icon",
            field=models.ImageField(
                blank=True, null=True, upload_to="images/", verbose_name="Event Icon"
            ),
        ),
    ]
