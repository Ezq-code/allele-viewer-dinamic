from rest_framework import serializers
from django.core.cache import cache


from apps.business_app.models import AlleleNode
from apps.business_app.utils.xslx_to_pdb_graph import (
    XslxToPdbGraph,
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
    children_qty = serializers.IntegerField(
        source="children.count",
    )
    children = ChildSerializer(many=True)
    predecessors = serializers.SerializerMethodField()
    sucessors = serializers.SerializerMethodField()

    class Meta:
        model = AlleleNode
        fields = [
            "id",
            "number",
            "unique_number",
            "element",
            "custom_element_name",
            "rs",
            "uploaded_file",
            "children_qty",
            "children",
            "region",
            "timeline_appearence",
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
        if not cache.get(graph_key):
            processor_object = XslxToPdbGraph(
                origin_file=obj.uploaded_file.original_file,
                uploaded_file_id=obj.uploaded_file_id,
            )
            processor_object.proccess_initial_file_data()

        return set(function_to_call(cache.get(graph_key), [], obj.number))

    def get_predecessors(self, obj):
        cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
            uploaded_file_id=obj.uploaded_file_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            cache.set(
                cache_key, self._get_graph_info(obj, extract_parents_tree), timeout=None
            )
        return cache.get(cache_key)

    def get_sucessors(self, obj):
        cache_key = AlleleNode.CACHE_KEY_SUCESSORS.format(
            uploaded_file_id=obj.uploaded_file_id, number=obj.number
        )
        if not cache.has_key(cache_key):
            cache.set(
                cache_key,
                self._get_graph_info(obj, extract_children_tree),
                timeout=None,
            )
        return cache.get(cache_key)
