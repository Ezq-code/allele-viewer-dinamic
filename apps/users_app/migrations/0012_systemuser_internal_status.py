# Generated by Django 5.0.6 on 2024-07-23 14:04

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "users_app",
            "0011_remove_systemuser_country_remove_systemuser_gender_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="systemuser",
            name="internal_status",
            field=models.CharField(
                choices=[("R", "registered"), ("C", "confirmed"), ("P", "has paid")],
                default="R",
                max_length=1,
                verbose_name="internal status",
            ),
        ),
    ]
