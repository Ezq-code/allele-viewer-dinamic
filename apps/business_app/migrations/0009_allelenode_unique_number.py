# Generated by Django 4.2.1 on 2023-09-29 03:45

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0008_alter_allelenode_uploaded_file"),
    ]

    operations = [
        migrations.AddField(
            model_name="allelenode",
            name="unique_number",
            field=models.PositiveIntegerField(
                blank=True, null=True, unique=True, verbose_name="Unique Number"
            ),
        ),
    ]