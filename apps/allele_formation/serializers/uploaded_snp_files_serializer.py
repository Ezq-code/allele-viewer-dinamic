from rest_framework import serializers
from apps.allele_formation.models.uploaded_snp_files import UploadedSNPFiles


class UploadedSNPFileSerializer(serializers.ModelSerializer):
    gene_name = serializers.CharField(source="gene.name", read_only=True, default=None)

    class Meta:
        model = UploadedSNPFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "snp_file",
            "system_user",
            "gene",
            "gene_name",
            "predefined",
        ]

    def save(self, **kwargs):
        try:
            instance = super().save(**kwargs)
            self.Meta.model.objects.filter(gene=instance.gene).exclude(
                id=instance.id
            ).update(predefined=False)
            return instance
        except Exception as e:
            raise serializers.ValidationError(e) from e
