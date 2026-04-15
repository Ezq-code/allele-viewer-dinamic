from rest_framework import serializers
from django.core.cache import cache


from apps.business_app.models import AlleleNode
from apps.business_app.tasks import build_uploaded_file_graph_cache_task
from apps.business_app.utils.xslx_to_pdb_graph import (
    extract_children_tree,
    extract_parents_tree,
)


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleNode
        fields = [
            "id",
            "number",
        ]
        read_only_fields = [
            "id",
            "number",
        ]


class AlleleNodeSerializer(serializers.ModelSerializer):
    # children_qty = serializers.IntegerField(
    #     source="children.count",
    # )
    # children = ChildSerializer(many=True)
    # predecessors = serializers.SerializerMethodField()
    # sucessors = serializers.SerializerMethodField()

    class Meta:
        model = AlleleNode
        fields = [
            "id",
            "number",
            "unique_number",
            "element",
            "custom_element_name",
            "rs",
            # "uploaded_file",
            # "children_qty",
            # "children",
            "region",
            "timeline_appearence",
            "sphere_radius",
            "stick_radius",
            "loss",
            "increment",
            "age_1",
            "age_2",
            # "frec_afr_amr",
            # "frec_amr",
            # "frec_csa",
            # "frec_eas",
            # "frec_eur",
            # "frec_lat",
            # "frec_nea",
            # "frec_oce",
            # "frec_ssa",
            # "frec_afr_eas",
            # "frec_afr_swe",
            # "frec_afr_nor",
            # "frec_ca",
            # "frec_sa",
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
        graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_FILE.format(
            uploaded_file_id=obj.uploaded_file_id
        )
        graph = cache.get(graph_key)
        if not graph:
<<<<<<< HEAD
            build_uploaded_file_graph_cache_task.delay(obj.uploaded_file_id)
=======
            build_uploaded_file_graph_cache_task(obj.uploaded_file_id)
>>>>>>> dev
            return None

        return set(function_to_call(graph, [], obj.number))

    def get_predecessors(self, obj):
        cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
            uploaded_file_id=obj.uploaded_file_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            graph_info = self._get_graph_info(obj, extract_parents_tree)
            if graph_info is None:
                return []
            cache.set(cache_key, graph_info, timeout=None)
        return cache.get(cache_key)

    def get_sucessors(self, obj):
        cache_key = AlleleNode.CACHE_KEY_SUCESSORS.format(
            uploaded_file_id=obj.uploaded_file_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            graph_info = self._get_graph_info(obj, extract_children_tree)
            if graph_info is None:
                return []
            cache.set(cache_key, graph_info, timeout=None)
        return cache.get(cache_key)
