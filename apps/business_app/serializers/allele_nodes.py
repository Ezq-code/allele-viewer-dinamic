from rest_framework import serializers

from apps.business_app.models import AlleleNode


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

    class Meta:
        model = AlleleNode
        fields = [
            "id",
            "number",
            "unique_number",
            "element",
            "custom_element_name",
            "symbol",
            "rs",
            "uploaded_file",
            "children_qty",
            "children",
            "region",
        ]
        read_only_fields = [
            "id",
            "uploaded_file",
            "unique_number",
            "children_qtity",
            "children",
        ]
