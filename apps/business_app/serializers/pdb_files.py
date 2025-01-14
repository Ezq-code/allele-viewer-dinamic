from rest_framework import serializers


from apps.business_app.models.pdb_files import PdbFiles


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
    nx_graph_k = serializers.FloatField(default=0.5)
    nx_graph_training_iterations = serializers.IntegerField(default=10)
    nx_graph_scale = serializers.IntegerField(default=500)
