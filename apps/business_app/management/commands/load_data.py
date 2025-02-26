from django.core.management import call_command
from django.core.management.base import BaseCommand
from termcolor import colored


class Command(BaseCommand):
    help = "Loads initial fixtures"

    def handle(self, *args, **options):
        call_command("loaddata", "event_type.json")
        print(
            colored(
                "Successfully added event types",
                "green",
                attrs=["blink"],
            )
        )
        call_command("loaddata", "event.json")
        print(
            colored(
                "Successfully added events",
                "green",
                attrs=["blink"],
            )
        )
        call_command("loaddata", "marker_new.json")
        print(
            colored(
                "Successfully added markers for new events",
                "green",
                attrs=["blink"],
            )
        )
