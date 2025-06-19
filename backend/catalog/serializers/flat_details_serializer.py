from rest_framework import serializers
from catalog.models import Flat

class PriceSerializer(serializers.Serializer):
    value = serializers.FloatField()
    currency = serializers.CharField()

class FlatDetailSerializer(serializers.ModelSerializer):
    specifics = serializers.SerializerMethodField()
    price = PriceSerializer()
    contact = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = [
            'id', 
            'property_type', 
            # 'zoning_type', 
            'status', 
            'address', 
            'map_link',
            'price', 
            'area', 
            'date_added', 
            'contact', 
            'photos',
            'specifics',
        ]

    def get_price(self, obj):
        return {
            "value": obj.price_value,
            "currency": obj.price_currency,
        }

    def get_contact(self, obj):
        if obj.contact:
            return {
                "id": obj.contact.id,
                "name": obj.contact.name,
                "phone": obj.contact.phone,
            }
        return None

    def get_specifics(self, obj):
        return {
            "rooms": obj.rooms,
            "floor": {
                "current": obj.floor_current,
                "full": obj.floor_full,
            },
            "heating": obj.heating,
            "renovation": obj.renovation,
            "furnished": obj.furnished,
            "kitchen": obj.kitchen_type,
            "sharedFacilities": {
                "kitchen": obj.shared_kitchen,
                "bathroom": obj.shared_bathroom,
            },
            "utilities": {
                "electricity": obj.has_electricity,
                "waterSupply": obj.has_water,
                "naturalGas": obj.has_gas,
                "sewerage": obj.has_sewerage,
                "internet": obj.has_internet,
            },
        }
