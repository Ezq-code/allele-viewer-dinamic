from rest_framework import serializers
from apps.business_app.models.gene_group import GeneGroups
from apps.business_app.models.disorder import Disorder


class GeneGroupMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneGroups
        fields = ['id', 'name']


class DisorderMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disorder
        fields = ['id', 'name']