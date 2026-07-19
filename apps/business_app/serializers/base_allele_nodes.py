from rest_framework import serializers
from django.core.cache import cache

from apps.business_app.tasks import build_uploaded_file_graph_cache_task
from apps.business_app.utils.graph_functions import (
    extract_children_tree,
    extract_parents_tree,
)


class BaseAlleleNodeSerializer(serializers.ModelSerializer):
    """
    Abstract base serializer for AlleleNode-like models with caching support.

    Provides shared functionality for:
    - Graph-aware field retrieval (predecessors/successors)
    - Cache-based optimization
    - Common metadata field handling
    """

    class Meta:
        # Subclasses must define model and fields
        abstract = True
        fields = [
            "id",
            "number",
            "order",
            "unique_number",
            "element",
            "allele",
            "rs",
            "region",
            "timeline_appearence",
            "sphere_radius",
            "stick_radius",
            "loss",
            "increment",
            "age_1",
            "age_2",
            "predecessors",
            "sucessors",
        ]
        read_only_fields = [
            "id",
            "uploaded_file",
            "unique_number",
            "children_qty",
            "children",
            "sphere_radius",
            "stick_radius",
            "loss",
            "increment",
            "age_1",
            "age_2",
            "frec_afr_amr",
            "frec_amr",
            "frec_csa",
            "frec_eas",
            "frec_eur",
            "frec_lat",
            "frec_nea",
            "frec_oce",
            "frec_ssa",
            "frec_afr_eas",
            "frec_afr_swe",
            "frec_afr_nor",
            "frec_ca",
            "frec_sa",
            "predecessors",
            "sucessors",
        ]

    def _get_graph_info(self, obj, function_to_call):
        """
        Fetch graph information from cache or trigger cache build task.

        Args:
            obj: The AlleleNode-like instance
            function_to_call: Function to extract tree data (extract_parents_tree or extract_children_tree)

        Returns:
            set: Set of node numbers in the graph, or None if graph not available
        """
        model_class = self.Meta.model
        # uploaded_file_id = obj.study.uploaded_file_id # TODO remove if not necesary
        study_id = obj.study_id
        graph_key = model_class.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=study_id)
        graph = cache.get(graph_key)
        if not graph:
            build_uploaded_file_graph_cache_task(study_id)
            return None

        return set(function_to_call(graph, [], obj.number))

    def get_predecessors(self, obj):
        """Retrieve predecessor nodes from cache or compute them."""
        model_class = self.Meta.model
        study_id = obj.study.id
        cache_key = model_class.CACHE_KEY_DESCENDANTS.format(
            study_id=study_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            graph_info = self._get_graph_info(obj, extract_parents_tree)
            if graph_info is None:
                return []
            cache.set(cache_key, graph_info, timeout=None)
        return cache.get(cache_key)

    def get_sucessors(self, obj):
        """Retrieve successor nodes from cache or compute them."""
        model_class = self.Meta.model
        study_id = obj.study.id
        cache_key = model_class.CACHE_KEY_SUCESSORS.format(
            study_id=study_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            graph_info = self._get_graph_info(obj, extract_children_tree)
            if graph_info is None:
                return []
            cache.set(cache_key, graph_info, timeout=None)
        return cache.get(cache_key)
