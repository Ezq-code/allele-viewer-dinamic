from logging import config
from rest_framework import serializers

from apps.business_app.models import AlleleNode
from apps.business_app.models.site_configurations import SiteConfiguration


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
    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        self.config = SiteConfiguration.get_solo()

    children_qty = serializers.IntegerField(
        source="children.count",
    )
    children = ChildSerializer(many=True)
    sphere_radius = serializers.SerializerMethodField()
    stick_radius = serializers.SerializerMethodField()

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
        ]
        read_only_fields = [
            "id",
            "uploaded_file",
            "unique_number",
            "children_qtity",
            "children",
        ]

    def get_sphere_radius(self, obj):
        return self.get_base_radius(obj=obj) * self.config.sphere_radius_factor

    def get_stick_radius(self, obj):
        return self.get_base_radius(obj=obj)

    def get_base_radius(self, obj):
        const_to_use = (
            self.config.stick_radius_min_value
            if not obj.children
            else self.config.stick_radius_if_children
        )
        return const_to_use + self.config.stick_radius_factor * obj.children.count()
