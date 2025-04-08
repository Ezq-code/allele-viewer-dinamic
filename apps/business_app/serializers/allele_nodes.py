from networkx import predecessor
from rest_framework import serializers

from apps.business_app.models import AlleleNode
from apps.business_app.utils.xslx_to_pdb_graph import extract_parents_tree


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
            "origin_1",
            "origin_2",
            "frec_afr",
            "frec_eas",
            "frec_sas",
            "frec_eur",
            "frec_ame",
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
            "origin_1",
            "origin_2",
            "frec_afr",
            "frec_eas",
            "frec_sas",
            "frec_eur",
            "frec_ame",
            "predecessors",
            "sucessors",
        ]

    def get_predecessors(self, obj):
        return ""

    def get_sucessors(self, obj):
        return ""
