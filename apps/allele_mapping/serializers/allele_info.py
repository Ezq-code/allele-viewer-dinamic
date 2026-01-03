from rest_framework import serializers
from apps.allele_mapping.models.allele_info import AlleleInfo


class AlleleInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlleleInfo
        fields = "__all__"
