from apps.business_app.models.sub_country import SubCountry
from apps.allele_mapping.models.allele_region import AlleleRegion

SPECIAL_SUB_COUNTRY_MAPPINGS = {
    "england": "United Kingdom",
    "wales": "United Kingdom",
    "scotland": "United Kingdom",
    "usa": "United States",
    "russia": "Russian Federation",
    "venezuela": "Venezuela, Bolivarian Republic of",
    "vietnam": "Viet Nam",
    "bolivia": "Bolivia, Plurinational State of",
    "iran": "Iran, Islamic Republic of",
    "taiwan": "Taiwan, Province of China",
    "south korea": "Korea, Republic of",
    "north korea": "Korea, Democratic People's Republic of",
    "azores": "Portugal",
    "madeira": "Portugal",
    "gaza": "Palestine, State of",
    "palestine": "Palestine, State of",
    "kosovo": "Albania",
    "sao tome": "Sao Tome and Principe",
    "macedonia": "Macedonia, the Former Yugoslav Republic of",
    "tanzania": "Tanzania, United Republic of",
    "borneo": "Malaysia",
}


def populate_sub_country_from_population(batch_size=1000):
    all_subcountries = list(SubCountry.objects.all().order_by("-name"))
    allele_regions_to_update = []

    for allele_region in AlleleRegion.objects.filter(
        sub_country__isnull=True
    ).iterator():
        subcountry_value = allele_region.sub_country_incoming_name
        if not subcountry_value:
            continue

        subcountry_lower = subcountry_value.lower().replace("-", " ").strip()
        sub_country = None

        for key, country_name in SPECIAL_SUB_COUNTRY_MAPPINGS.items():
            if subcountry_lower.startswith(key):
                sub_country = next(
                    (
                        sub_country
                        for sub_country in all_subcountries
                        if sub_country.name.lower().startswith(country_name.lower())
                    ),
                    None,
                )
                if sub_country:
                    break

        if not sub_country:
            for sc in all_subcountries:
                if subcountry_lower.startswith(sc.name.lower()):
                    sub_country = sc
                    break

        if sub_country and allele_region.sub_country_id != sub_country.id:
            allele_region.sub_country = sub_country
            allele_regions_to_update.append(allele_region)

    if allele_regions_to_update:
        AlleleRegion.objects.bulk_update(
            allele_regions_to_update,
            ["sub_country"],
            batch_size=batch_size,
        )

    return len(allele_regions_to_update)
