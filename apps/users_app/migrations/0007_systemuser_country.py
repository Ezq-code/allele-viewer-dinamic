# Generated by Django 4.2.1 on 2023-07-21 17:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("users_app", "0006_country"),
    ]

    operations = [
        migrations.AddField(
            model_name="systemuser",
            name="country",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="users_app.country",
            ),
        ),
    ]
