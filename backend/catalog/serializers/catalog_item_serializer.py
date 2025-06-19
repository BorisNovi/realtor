from rest_framework import serializers
from contacts.serializers import ContactSerializer

class CatalogItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    photos = serializers.ListField(child=serializers.URLField())
    property_type = serializers.CharField()
    # zoning_type = serializers.CharField()
    status = serializers.CharField()
    address = serializers.CharField()
    map_link = serializers.URLField(allow_null=True, required=False)
    price = serializers.SerializerMethodField()
    area = serializers.DecimalField(max_digits=7, decimal_places=2)
    date_added = serializers.DateTimeField()
    contact = ContactSerializer(required=False, allow_null=True, default=None)

    def get_price(self, obj):
        return {
            "value": obj.price_value,
            "currency": obj.price_currency,
        }
