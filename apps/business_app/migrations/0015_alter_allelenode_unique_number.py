# Generated by Django 4.2.1 on 2024-02-17 20:23

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0014_alter_allelenode_uploaded_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="allelenode",
            name="unique_number",
            field=models.CharField(
                max_length=100, unique=True, verbose_name="Unique Number"
            ),
        ),
    ]