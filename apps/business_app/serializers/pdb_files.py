from email.policy import default
from rest_framework import serializers


from apps.business_app.models.pdb_files import PdbFiles
from apps.business_app.models.site_configurations import SiteConfiguration


class PdbFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PdbFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "pdb_content",
        ]
        read_only_fields = ["id", "pdb_content"]


class PdbFilesGraphUpdateSerializer(serializers.Serializer):
    nx_graph_dim = serializers.IntegerField(default=3)
    nx_graph_k = serializers.FloatField(default=0.15)
    nx_graph_training_iterations = serializers.IntegerField(default=10)
