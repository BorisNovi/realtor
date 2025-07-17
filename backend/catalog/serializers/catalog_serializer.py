from rest_framework import serializers
from .flat_serializer import FlatSerializer
from .office_serializer import OfficeSerializer
from .land_serializer import LandPlotSerializer
from contacts.serializers import ContactSerializer
from .address_serializer import AddressSerializer
from catalog.parsers.specifics_parser import flatten_specifics


PROPERTY_SERIALIZER_MAP = {
    'flat': FlatSerializer,
    'office': OfficeSerializer,
    'landplot': LandPlotSerializer,
}

class PriceSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3)

class CatalogCreateSerializer(serializers.Serializer):
    property_type = serializers.ChoiceField(choices=list(PROPERTY_SERIALIZER_MAP.keys()))
    status = serializers.CharField()
    address = AddressSerializer()
    area = serializers.DecimalField(max_digits=7, decimal_places=2)
    price = PriceSerializer()
    title = serializers.CharField(required=False, allow_blank=True)
    map_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_added = serializers.DateTimeField(required=False)
    contact = ContactSerializer(required=False, allow_null=True, default=None)

    specifics = serializers.DictField(required=False)

    def to_internal_value(self, data):
        base_fields = super().to_internal_value(data)
        known_fields = set(self.fields.keys())
        extra_fields = {
            k: v for k, v in data.items() if k not in self.fields
        }
        base_fields['extra_fields'] = extra_fields
        return base_fields

    def create(self, validated_data):
        contact_data = validated_data.pop('contact', None)
        contact = None

        if contact_data:
            contact_serializer = ContactSerializer(data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()

        property_type = validated_data.pop('property_type')
        extra_fields = validated_data.pop('extra_fields', {})

        price_data = validated_data.pop('price', {})
        validated_data['price_value'] = price_data.get('value')
        validated_data['price_currency'] = price_data.get('currency')

        address_data = validated_data.pop('address', {})
        validated_data['address'] = address_data

        specifics = validated_data.pop('specifics', {})
        specifics_flat = flatten_specifics(property_type, specifics)

        combined_data = {**validated_data, **extra_fields, **specifics_flat}

        if contact is not None:
            combined_data['contact'] = contact.id

        serializer_class = PROPERTY_SERIALIZER_MAP[property_type]
        serializer = serializer_class(data=combined_data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def update(self, instance, validated_data):
        contact_data = validated_data.pop('contact', None)
        if contact_data:
            contact_serializer = ContactSerializer(instance=instance.contact, data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()
            instance.contact = contact

        price_data = validated_data.pop('price', {})
        if price_data:
            instance.price_value = price_data.get('value', instance.price_value)
            instance.price_currency = price_data.get('currency', instance.price_currency)

        specifics = validated_data.pop('specifics', {})
        specifics_flat = flatten_specifics(specifics)

        extra_fields = validated_data.pop('extra_fields', {})
        forbidden_fields = ['property_type', 'id']

        for attr, value in {**validated_data, **specifics_flat, **extra_fields}.items():
            if attr in forbidden_fields:
                continue
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        for property_type, serializer_class in PROPERTY_SERIALIZER_MAP.items():
            if isinstance(instance, serializer_class.Meta.model):
                return serializer_class(instance).data
        return super().to_representation(instance)
