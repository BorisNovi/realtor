from rest_framework import serializers
from catalog.models import Flat

from catalog.interfaces.contact import get_contact
from catalog.interfaces.price import get_price
from catalog.interfaces.specifics.flat_spec import get_flat_specifics

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
        return get_price(obj)

    def get_contact(self, obj):
        return get_contact(obj.contact)

    def get_specifics(self, obj):
        return get_flat_specifics(obj)
