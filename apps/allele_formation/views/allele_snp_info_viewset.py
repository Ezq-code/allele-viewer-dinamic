from rest_framework import viewsets
from apps.allele_formation.models.allele_snp_info import AlleleSNPInfo
from apps.allele_formation.serializers.allele_snp_info_serializer import (
    AlleleSNPInfoSerializer,
)


class AlleleSNPInfoViewSet(viewsets.ModelViewSet):
    queryset = AlleleSNPInfo.objects.all()
    serializer_class = AlleleSNPInfoSerializer
