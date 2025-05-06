from django.core.management import call_command
from django.core.management.base import BaseCommand
from termcolor import colored

from apps.business_app.models.region import Region
from apps.business_app.models.region_county import RegionCountry
from apps.users_app.models.country import Country


class Command(BaseCommand):
    help = "Loads initial fixtures"

    def handle(self, *args, **options):
        self.fill_regions()

    def fill_regions(self):
        """
        This is a dict with a symbol as a key, and a tuple as a value with 3 elements in this order:
        name, color, [list_of_countries]
        """
        countries_by_region = {
            "AFR-AMR": [  # African American/Afro-Caribbean
                "African American/Afro-Caribbean",
                "#ffffff",
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
                ],
            ],
            "AMR": [  # American
                "American",
                "#ffffff",
                ["ca", "us"],
            ],
            "CSA": [  # Central/South-Asian
                "Central/South-Asian",
                "#ffffff",
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
                ],
            ],
            "EAS": [  # East Asian
                "East Asian",
                "#ffffff",
                ["cn", "jp", "kr", "mn", "tw", "hk"],
            ],
            "EUR": [  # European
                "European",
                "#ffffff",
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
                ],
            ],
            "LAT": [  # Latino
                "Latino",
                "#ffffff",
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
                ],
            ],
            "NEA": [  # Near Eastern
                "Near Eastern",
                "#ffffff",
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
                ],
            ],
            "OCE": [  # Oceanian
                "Oceanian",
                "#ffffff",
                ["au", "nz"],
            ],
            "SSA": [  # Sub-Saharan African
                "Sub-Saharan African",
                "#ffffff",
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
                "#ffffff",
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
                "#ffffff",
                ["ao", "bw", "ls", "na", "sz", "za", "zm", "zw"],
            ],
            "AFR-NOR": [  # North-African
                "North-African",
                "#ffffff",
                ["dz", "eg", "ly", "ma", "tn"],
            ],
            "CA": [  # Central-Asian
                "Central-Asian",
                "#ffffff",
                ["kz", "kg", "tj", "tm", "uz"],
            ],
            "SA": [  # South-Asian
                "South-Asian",
                "#ffffff",
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
