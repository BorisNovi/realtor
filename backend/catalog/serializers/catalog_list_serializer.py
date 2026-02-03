from rest_framework import serializers
from catalog.catalog_models import Property
from catalog.serializers.catalog_price_serializer import build_price
from contacts.contact_serializers import ContactSerializer
from .catalog_address_serializer import AddressSerializer

# Сериализатор для запроса списка всех объектов в сокращенном формате. 
# Используется в CatalogListView
class CatalogListSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField() 
    property_type = serializers.ReadOnlyField()
    address = AddressSerializer()
    contact = ContactSerializer()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Property  
        fields = [
            'id','property_type', 'status', 'photos', 'address', 'zoning_type',
            'price', 'area','contact', 'comment','date_added',
        ]

    def get_price(self, obj):
        return build_price(obj)
        
    