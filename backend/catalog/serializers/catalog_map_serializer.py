# catalog/serializers/catalog_map_serializer.py
from rest_framework import serializers
from .catalog_address_serializer import AddressSerializer

class CatalogMapSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    propertyType = serializers.CharField()
    status = serializers.CharField()
    address = AddressSerializer()
