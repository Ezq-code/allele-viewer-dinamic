# Generated by Django 4.2.1 on 2024-02-20 04:25

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("business_app", "0016_pdbfiles"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="uploadedfiles",
            name="processed_file",
        ),
    ]
