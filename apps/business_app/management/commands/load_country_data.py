from django.core.management.base import BaseCommand

from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country
from django.core.management import call_command
from termcolor import colored


class Command(BaseCommand):
    help = "Loads regional info"

    def handle(self, *args, **options):
        self.fill_regions()

    def fill_regions(self):
        call_command("loaddata", "countries.json")
        print(
            colored(
                "Successfully added countries",
                "green",
                attrs=["blink"],
            )
        )

        """
        This is a dict with a symbol as a key, and a tuple as a value with 3 elements in this order:
        name, color, [list_of_countries]
        """
        countries_by_region = {
            "AFR-AMR": [  # African American/Afro-Caribbean
                "African American/Afro-Caribbean",
                "#FFA500",
                [
                    "ag",
                    "ai",
                    "bs",
                    "bb",
                    "cu",
                    "do",
                    "gf",
                    "gy",
                    "ht",
                    "jm",
                    "sr",
                    "tt",
                    "lc",
                    "dm",
                    "kn",
                ],
            ],
            "AMR": [  # American
                "American",
                "#d628c2",
                [
                    "ca",
                    "us",
                    "gl",
                ],
            ],
            "CSA": [  # Central/South-Asian
                "Central/South-Asian",
                "#FFDB58",
                [
                    "kz",
                    "kg",
                    "tj",
                    "tm",
                    "uz",  # From Central-Asia
                    "af",
                    "bd",
                    "bt",
                    "in",
                    "mv",
                    "np",
                    "pk",
                    "lk",  # From South-Asia
                    "ru",
                    "ua",
                    "ge",
                    "kh",
                    "am",
                    "vn",
                    "la",
                    "by",
                    "md",
                ],
            ],
            "EAS": [  # East Asian
                "East Asian",
                "#0000A0",
                ["cn", "jp", "kr", "mn", "tw", "hk", "kp"],
            ],
            "EUR": [  # European
                "European",
                "#0000FF",
                [
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
                    "rs",
                    "mk",
                    "ba",
                ],
            ],
            "LAT": [  # Latino
                "Latino",
                "#FF0000",
                [
                    "ar",
                    "bz",
                    "bo",
                    "br",
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
                    "ht",
                    "jm",
                    "mx",
                    "ni",
                    "pa",
                    "py",
                    "pe",
                    "sr",
                    "tt",
                    "uy",
                    "ve",
                    "gf",
                    "fk",
                ],
            ],
            "NEA": [  # Near Eastern
                "Near Eastern",
                "#FF69B4",
                [
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
                    "az",
                ],
            ],
            "OCE": [  # Oceanian
                "Oceanian",
                "#8A2BE2",
                [
                    "au",
                    "nz",
                    "my",
                    "id",
                    "ph",
                    "mm",
                    "th",
                    "pg",
                    "bn",
                    "tl",
                    "sb",
                    "bu",
                    "nc",
                    "fj",
                ],
            ],
            "SSA": [  # Sub-Saharan African
                "Sub-Saharan African",
                "#7CFC00",
                [
                    "bj",
                    "bf",
                    "cm",
                    "cv",
                    "cf",
                    "cg",
                    "gq",
                    "ga",
                    "gh",
                    "gm",
                    "gn",
                    "gw",
                    "lr",
                    "ml",
                    "mr",
                    "mw",
                    "ne",
                    "ng",
                    "sl",
                    "sn",
                    "td",
                    "tg",
                    "ci",
                    "cd",
                    "mz",
                    "re",
                ],
            ],
            "AFR-EAS": [  # East-African
                "East-African",
                "#7CFC00",
                [
                    "bi",
                    "dj",
                    "er",
                    "et",
                    "ke",
                    "km",
                    "mg",
                    "mu",
                    "rw",
                    "sc",
                    "so",
                    "tz",
                    "ug",
                    "sd",
                ],
            ],
            "AFR-SWE": [  # South-West-African
                "South-West-African",
                "#00FF00",
                ["ao", "bw", "ls", "na", "sz", "za", "zm", "zw"],
            ],
            "AFR-NOR": [  # North-African
                "North-African",
                "#00FF00",
                ["dz", "eg", "ly", "ma", "tn"],
            ],
            "CA": [  # Central-Asian
                "Central-Asian",
                "#FFA500",
                ["kz", "kg", "tj", "tm", "uz"],
            ],
            "SA": [  # South-Asian
                "South-Asian",
                "#FFFF00",
                ["af", "bd", "bt", "in", "mv", "np", "pk", "lk"],
            ],
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
        print(
            colored(
                f"Successfully added {len(countries_by_region)} regions with their countries",
                "green",
                attrs=["blink"],
            )
        )
