from logging import config
from rest_framework import serializers

from apps.business_app.models import AlleleNode
from apps.business_app.models.site_configurations import SiteConfiguration
from django.core.cache import cache


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
    def __init__(self, *args, **kwargs):
        config = SiteConfiguration.get_solo()
        self.stick_radius_min_value = config.stick_radius_min_value
        self.stick_radius_if_children = config.stick_radius_if_children
        self.stick_radius_factor = config.stick_radius_factor
        self.sphere_radius_factor = config.sphere_radius_factor
        super().__init__(*args, **kwargs)

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
        cached_sphere_radious = cache.get(f"sphere_radius_for_{obj.children.count()}_children")
        if cached_sphere_radious:
            return cached_sphere_radious
        new_sphere_radius_value = self.get_stick_radius(obj=obj) * self.sphere_radius_factor
        cache.set(f"sphere_radius_for_{obj.children.count()}_children", new_sphere_radius_value)
        return new_sphere_radius_value
        

    def get_stick_radius(self, obj):
        cached_stick_radious = cache.get(f"stick_radius_for_{obj.children.count()}_children")
        if cached_stick_radious:
            return cached_stick_radious
        
        const_to_use = (
            self.stick_radius_min_value
            if not obj.children
            else self.stick_radius_if_children
        )
        new_stick_radius_value = const_to_use + self.stick_radius_factor * obj.children.count()
        cache.set(f"stick_radius_for_{obj.children.count()}_children", new_stick_radius_value)
        return new_stick_radius_value
        
        
