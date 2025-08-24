from rest_framework import serializers

from apps.business_app.models import UploadedFiles
import logging

from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.pdb_files import PdbFilesSerializer
from django.core.cache import cache


logger = logging.getLogger(__name__)


class UploadedFilesSerializer(serializers.ModelSerializer):
    pdb_files = PdbFilesSerializer(many=True, read_only=True)
    gene_name = serializers.CharField(source="gene.name", read_only=True, default=None)
    allele_nodes = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFiles
        fields = [
            "id",
            "custom_name",
            "description",
            "original_file",
            "system_user",
            "gene",
            "gene_name",
            "pdb_files",
            "allele_nodes",
        ]
        read_only_fields = [
            "id",
        ]

    def save(self):
        try:
            return super().save()
        except Exception as e:
            logger.error(f"{str(e)}")
            raise serializers.ValidationError(e) from e

    def get_allele_nodes(self, obj):
        allele_nodes_key = UploadedFiles.CACHE_KEY_RELATED_ALLELE_NODES.format(
            uploaded_file_id=obj.id
        )
        info = None
        if not cache.has_key(allele_nodes_key):
            info = AlleleNodeSerializer(obj.allele_nodes, many=True).data
            cache.set(allele_nodes_key, info)
        return cache.get(allele_nodes_key)
