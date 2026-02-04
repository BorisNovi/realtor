# catalog/serializers/house_create_update_serializer.py
from rest_framework import serializers
from catalog.catalog_models import House
from catalog.serializers.base_create_update_serializer import BaseCreateUpdateSerializer
from django.db import transaction
from catalog.serializers.catalog_address_serializer import AddressSerializer
from contacts.contact_serializers import ContactSerializer
from catalog.serializers.catalog_price_serializer import build_price

def flatten_house_specifics(specifics: dict) -> dict:
    specifics = specifics or {}
    result = {}

    # floor
    floor = specifics.get('floor') or {}
    result['floor_current'] = floor.get('current')
    result['floor_full'] = floor.get('full')

    # options
    options = specifics.get('options') or {}

    # sharedFacilities
    shared = options.get('shared_facilities') or {}
    result['shared_kitchen'] = shared.get('kitchen', False)
    result['shared_bathroom'] = shared.get('bathroom', False)

    # utilities
    utilities = options.get('utilities') or {}
    result['electricity'] = utilities.get('electricity', False)
    result['water_supply'] = utilities.get('water_supply', False)
    result['natural_gas'] = utilities.get('natural_gas', False)
    result['sewerage'] = utilities.get('sewerage', False)
    result['internet'] = utilities.get('internet', False)

    # other
    other = options.get('other') or {}
    result['parking'] = other.get('parking', False)
    result['bath'] = other.get('bath', False)
    result['shower'] = other.get('shower', False)
    result['air_conditioning'] = other.get('air_conditioning', False)
    result['fireplace'] = other.get('fireplace', False)
    result['beautiful_view'] = other.get('beautiful_view', False)
    result['new_building'] = other.get('new_building', False)
    result['elevator'] = other.get('elevator', False)
    result['balcony'] = other.get('balcony', False)
    result['garden'] = other.get('garden', False)
    result['garage'] = other.get('garage', False)

    # простые поля
    result['rooms'] = specifics.get('rooms')
    result['kitchen_type'] = specifics.get('kitchen')
    result['heating'] = specifics.get('heating')
    result['furnished'] = specifics.get('furnished')
    result['renovation'] = specifics.get('renovation')

    return result

# Сериализатор для создания/обновления объектов House
class HouseCreateUpdateSerializer(BaseCreateUpdateSerializer):
    specifics = serializers.DictField(required=False)

    class Meta(BaseCreateUpdateSerializer.Meta):
        model = House
        fields = BaseCreateUpdateSerializer.Meta.fields + ['specifics']

    @transaction.atomic
    def create(self, validated_data):
        specifics = validated_data.pop('specifics', {})
        validated_data.update(flatten_house_specifics(specifics))
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        specifics = validated_data.pop('specifics', {})
        validated_data.update(flatten_house_specifics(specifics))
        return super().update(instance, validated_data)

# Сериализатор для чтения объектов House и возврата структурированного ответа
class HouseReadSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField() 
    property_type = serializers.ReadOnlyField()
    address = AddressSerializer()
    contact = ContactSerializer()
    price = serializers.SerializerMethodField()
    specifics = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            'id', 'property_type', 'status', 'photos', 'address', 'zoning_type',
            'price', 'area', 'contact', 'comment', 'date_added', 'specifics'
        ]

    def get_price(self, obj):
        return build_price(obj)
    
    def get_specifics(self, obj):
        return {
            "rooms": obj.rooms,
            "floor": {"current": obj.floor_current, "full": obj.floor_full},
            "kitchen": obj.kitchen_type,
            "heating": obj.heating,
            "furnished": obj.furnished,
            "renovation": obj.renovation,
            "options": {
                "sharedFacilities": {
                    "kitchen": obj.shared_kitchen,
                    "bathroom": obj.shared_bathroom
                },
                "utilities": {
                    "electricity": obj.electricity,
                    "waterSupply": obj.water_supply,
                    "naturalGas": obj.natural_gas,
                    "sewerage": obj.sewerage,
                    "internet": obj.internet
                },
                "other": {
                    "parking": obj.parking,
                    "bath": obj.bath,
                    "shower": obj.shower,
                    "airConditioning": obj.air_conditioning,
                    "fireplace": obj.fireplace,
                    "beautifulView": obj.beautiful_view,
                    "newBuilding": obj.new_building,
                    "elevator": obj.elevator,
                    "balcony": obj.balcony,
                    "garden": obj.garden,
                    "garage": obj.garage
                }
            }
        }
