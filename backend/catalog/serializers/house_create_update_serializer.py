# catalog/serializers/house_create_update_serializer.py
from django.db import transaction
from rest_framework import serializers
from catalog.catalog_models import House
from catalog.serializers.base_create_update_serializer import BaseCreateUpdateSerializer
from catalog.serializers.specifics import flatten_specifics, build_specifics
from catalog.serializers.catalog_address_serializer import AddressSerializer
from contacts.contact_serializers import ContactSerializer
from catalog.serializers.catalog_price_serializer import build_price


# Сериализатор для создания/обновления объектов House
class HouseCreateUpdateSerializer(BaseCreateUpdateSerializer):
    specifics = serializers.DictField(required=False)

    class Meta(BaseCreateUpdateSerializer.Meta):
        model = House
        fields = BaseCreateUpdateSerializer.Meta.fields + ['specifics']

    @transaction.atomic
    def create(self, validated_data):
        specifics = validated_data.pop('specifics', {})
        validated_data.update(flatten_specifics(specifics))
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        specifics = validated_data.pop('specifics', None)

        if specifics is not None:
            validated_data.update(flatten_specifics(specifics))
        
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
            'id', 'name', 'property_type', 'status', 'photos', 'address', 'zoning_type',
            'price', 'area', 'contact', 'comment', 'date_added', 'specifics', 
        ]
        read_only_fields = ['id', 'date_added']

    def get_price(self, obj):
        return build_price(obj)
    
    def get_specifics(self, obj):
        return build_specifics (obj)
