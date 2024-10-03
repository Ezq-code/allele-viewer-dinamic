import json
from django.conf import settings
from pathlib import Path
from django.core.management.base import BaseCommand
from apps.business_app.models import Feature


class Command(BaseCommand):
    help = 'Load earthquake data from JSON file into the database'

    def handle(self, *args, **kwargs):
        static_root = Path(settings.STATIC_ROOT)
        file_path = static_root / 'assets' / 'dist' / 'Leaflet' / 'Leaflet.timeline' / 'migration-timeline.json'
        print(f"Intentando abrir el archivo en: {file_path}")

        if file_path.exists():
            print(f"El archivo existe en: {file_path}")
        else:
            print("El archivo no se encontró.", file_path)
            return

        with open(file_path, 'r', encoding='utf-8') as file:
            json_data = file.read()

        # Limpiar el JSONp para convertirlo en JSON
        try:
            data = json.loads(json_data)
        except json.JSONDecodeError as e:
            print(f"Error al decodificar JSON: {e}")
            return
            # Limpiar la tabla Feature antes de insertar nuevos datos
        Feature.objects.all().delete()
        print("Tabla Feature limpiada.")

            # Verificar si hay características para procesar
        if not data:
            print("No hay características para cargar.")
            return
        # Verificar si hay características para procesar
        if not data:
            print("No hay características para cargar.")
            return

        # Iterar sobre las características y guardarlas en la base de datos
        for feature in data:
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

        self.stdout.write(self.style.SUCCESS('Data loaded successfully!'))
