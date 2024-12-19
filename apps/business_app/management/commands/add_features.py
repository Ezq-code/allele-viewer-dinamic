from django.core.management.base import BaseCommand
from termcolor import colored
import json
from apps.business_app.models import Feature


class Command(BaseCommand):
    help = 'Load human-migrations data from JSON file into the database, clearing the table first'

    def handle(self, *args, **kwargs):
        with open('apps/business_app/fixtures/migration-timeline.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            # Verificar si hay features para procesar
            if not data:
                print()
                print(
                    colored(
                        "There are no features to load.",
                        "red",
                        attrs=["reverse", "blink"],
                    )
                )
                return

            # Limpiar la tabla Feature ANTES de insertar nuevos datos
            Feature.objects.all().delete()  # Esta línea elimina todos los registros
            print()
            print(
                colored(
                    f"Successfully cleaned features in the system",
                    "green",
                    attrs=["reverse", "blink"],
                )
            )
            # Iterar sobre las features y guardarlas en la base de datos
            counter = 0
            for feature in data:
                counter += 1
                properties = feature['properties']
                geometry = feature['geometry']
                Feature.objects.create(
                    feature_type=feature['type'],
                    feature_id=properties['id'],
                    mag=properties.get('mag'),
                    place=properties.get('place'),
                    time=properties['time'],
                    title=properties.get('title'),
                    timefinal=properties['timefinal'],
                    geometry_type=geometry['type'],
                    coordinates=geometry['coordinates']
                )
            print()
            print(
                colored(
                    f"Successfully added {counter} features to the system",
                    "green",
                    attrs=["reverse", "blink"],
                )
            )
