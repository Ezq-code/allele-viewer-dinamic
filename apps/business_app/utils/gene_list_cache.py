import hashlib
from urllib.parse import urlencode

from django.core.cache import cache


GENE_LIST_VERSION_KEY = "gene:list:version"
GENE_LIST_KEY_PREFIX = "gene:list"
GENE_LIST_DEFAULT_VERSION = 1


def get_gene_list_cache_version() -> int:
    version = cache.get(GENE_LIST_VERSION_KEY)
    if version is None:
        cache.set(GENE_LIST_VERSION_KEY, GENE_LIST_DEFAULT_VERSION, timeout=None)
        return GENE_LIST_DEFAULT_VERSION
    return int(version)


def build_gene_list_cache_key(query_params) -> str:
    normalized_items = []
    for key, values in query_params.lists():
        for value in sorted(values):
            normalized_items.append((key, value))

    normalized_items.sort(key=lambda item: (item[0], item[1]))
    serialized_query = urlencode(normalized_items, doseq=True)
    query_hash = hashlib.sha256(serialized_query.encode("utf-8")).hexdigest()
    version = get_gene_list_cache_version()
    return f"{GENE_LIST_KEY_PREFIX}:v{version}:{query_hash}"


def bump_gene_list_cache_version() -> int:
    try:
        return int(cache.incr(GENE_LIST_VERSION_KEY))
    except ValueError:
        # Key does not exist yet.
        new_version = GENE_LIST_DEFAULT_VERSION + 1
        cache.set(GENE_LIST_VERSION_KEY, new_version, timeout=None)
        return new_version
