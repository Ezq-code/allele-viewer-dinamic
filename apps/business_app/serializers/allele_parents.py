from rest_framework import serializers


class AlleleParentsSerializer(serializers.Serializer):
    pdb = serializers.IntegerField(required=True)
    allele_node = serializers.IntegerField(required=True)

    # def validate_pdb(self, value):
    #     exists = PdbFiles.objects.filter(id=value).exists()
    #     if not exists:
    #         raise serializers.ValidationError("PDB File not found")
    #     return value

    # def validate_allele_node(self, value):
    #     exists = AlleleNode.objects.filter(id=value).exists()
    #     if not exists:
    #         raise serializers.ValidationError("Allele Node not found")
    #     return value
