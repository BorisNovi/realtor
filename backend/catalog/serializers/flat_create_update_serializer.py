from rest_framework import serializers
from catalog.catalog_models import Flat
from catalog.serializers.specifics import flatten_specifics, build_specifics
from catalog.serializers.base_create_update_serializer import BaseCreateUpdateSerializer
from django.db import transaction
from catalog.serializers.catalog_address_serializer import AddressSerializer
from catalog.serializers.catalog_price_serializer import build_price
from contacts.contact_serializers import ContactSerializer

# Сериализатор для создания/обновления объектов Flat
class FlatCreateUpdateSerializer(BaseCreateUpdateSerializer):
    specifics = serializers.DictField(required=False)

    class Meta(BaseCreateUpdateSerializer.Meta):
        model = Flat
        fields = BaseCreateUpdateSerializer.Meta.fields + ['specifics']

    @transaction.atomic
    def create(self, validated_data):
        specifics = validated_data.pop('specifics', {}) or {}
        validated_data.update(flatten_specifics(specifics))
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        specifics = validated_data.pop('specifics', None)

        if specifics is not None:
            validated_data.update(flatten_specifics(specifics))
        
        return super().update(instance, validated_data)

# Сериализатор для чтения объектов Flat и возврата структурированного ответа
class FlatReadSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    contact = ContactSerializer()
    price = serializers.SerializerMethodField()
    specifics = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = [
            'id', 
            'name', 
            'property_type', 
            'status', 
            'photos', 
            'address', 
            'zoning_type',
            'price', 
            'area', 
            'contact', 
            'comment', 
            'date_added', 
            'specifics', 
        ]
        read_only_fields = ['id', 'date_added']

    def get_price(self, obj):
        return build_price(obj)
    
    def get_specifics(self, obj):
        return build_specifics(obj)
 