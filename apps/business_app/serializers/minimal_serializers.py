from rest_framework import serializers
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.models.disorder import Disorder
from apps.business_app.models.disease_group import DiseaseGroup
from apps.business_app.models.disease_subgroup import DiseaseSubGroup


class GeneGroupMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneGroups
        fields = ["id", "name"]


class DisorderMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disorder
        fields = ["id", "name"]


class DiseaseGroupMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseGroup
        fields = ["id", "name"]


class DiseaseSubGroupMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseSubGroup
        fields = ["id", "name"]
