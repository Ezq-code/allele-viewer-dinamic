from django.core.management import call_command
from django.core.management.base import BaseCommand
from termcolor import colored

from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country


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

        call_command("loaddata", "event_gallery.json")
        print(
            colored(
                "Successfully added gallery for events",
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

    def fill_regions(apps, schema_editor):
        """
        This is a dict with a symbol as a key, and a tuple as a value with 3 elements in this order:
        name, color, [list_of_countries]
        """
        countries_by_region = {
            "AFR": (
                "Africa",
                "#ffffff",
                [
                    "ao",
                    "dz",
                    "bj",
                    "bw",
                    "bf",
                    "bi",
                    "cm",
                    "cv",
                    "cf",
                    "cg",
                    "dj",
                    "eg",
                    "gq",
                    "er",
                    "ma",
                    "et",
                    "ga",
                    "gh",
                    "gm",
                    "gn",
                    "gw",
                    "ke",
                    "ls",
                    "lr",
                    "mg",
                    "ml",
                    "mr",
                    "mu",
                    "mw",
                    "na",
                    "ne",
                    "ng",
                    "rw",
                    "sc",
                    "sd",
                    "sl",
                    "sn",
                    "so",
                    "sz",
                    "td",
                    "tg",
                    "tz",
                    "ug",
                    "za",
                    "zm",
                    "zw",
                    "ly",
                    "ci",
                    "cd",
                    "mz",
                    "tn",
                    "re",
                    "km",
                ],
            ),
            "Europe": [
                "at",
                "be",
                "bg",
                "hr",
                "cy",
                "cz",
                "dk",
                "ee",
                "fi",
                "fr",
                "de",
                "gr",
                "hu",
                "ie",
                "it",
                "lv",
                "lt",
                "lu",
                "mt",
                "nl",
                "pl",
                "pt",
                "ro",
                "sk",
                "si",
                "es",
                "se",
                "gb",
                "is",
                "no",
                "ch",
            ],
            "East-Asia": ["cn", "jp", "kr", "mn", "tw", "hk"],
            "South-Asia": ["af", "bd", "bt", "in", "mv", "np", "pk", "lk"],
            "America": [
                "ag",
                "ai",
                "ar",
                "bs",
                "bb",
                "bz",
                "bo",
                "br",
                "ca",
                "cl",
                "co",
                "cr",
                "cu",
                "do",
                "ec",
                "sv",
                "gt",
                "gy",
                "hn",
                "jm",
                "mx",
                "ni",
                "pa",
                "py",
                "pe",
                "sr",
                "tt",
                "us",
                "uy",
                "ve",
                "gf",
                "ht",
            ],
            "Middle-East": [
                "ae",
                "bh",
                "iq",
                "ir",
                "il",
                "jo",
                "kw",
                "lb",
                "om",
                "qa",
                "sa",
                "sy",
                "tr",
                "ye",
            ],
            "Central-Asia": ["kz", "kg", "tj", "tm", "uz"],
            "Australian": ["au", "nz"],
        }

        Region.objects.all().delete()
        region_countries = []

        for k, v in countries_by_region.items():
            name, color, countries = v
            region = Region.objects.create(symbol=k, name=name, color=color)
            for country_code in countries:
                db_country = Country.objects.filter(code__iexact=country_code).first()
                if db_country:
                    region_countries.append(
                        RegionCountry(region=region, country=db_country)
                    )
        RegionCountry.objects.bulk_create(region_countries)
