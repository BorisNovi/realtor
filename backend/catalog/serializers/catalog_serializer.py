from rest_framework import serializers
from rest_framework import serializers
from ..models import Contact
from .flat_serializer import FlatSerializer
from .office_serializer import OfficeSerializer
from .land_serializer import LandPlotSerializer
from .contact_serializer import ContactSerializer
# TODO: добавить HouseSerializer, GarageSerializer и т.п.

PROPERTY_SERIALIZER_MAP = {
    'flat': FlatSerializer,
    'office': OfficeSerializer,
    'landplot': LandPlotSerializer,
}

class PriceSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3)

class CatalogCreateSerializer(serializers.Serializer):
    # Обязательные поля
    property_type = serializers.ChoiceField(choices=list(PROPERTY_SERIALIZER_MAP.keys()))
    # zoning_type = serializers.CharField()
    status = serializers.CharField()
    address = serializers.CharField()
    area = serializers.DecimalField(max_digits=7, decimal_places=2)
    price = PriceSerializer()

    # Необязательные поля
    title = serializers.CharField(required=False, allow_blank=True)
    map_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_added = serializers.DateTimeField(required=False)

    contact = ContactSerializer()

    def to_internal_value(self, data):
        base_fields = super().to_internal_value(data)

        property_type = base_fields.get('property_type')
        extra_fields = {
            k: v for k, v in data.items() if k not in base_fields
        }

        base_fields['extra_fields'] = extra_fields
        return base_fields

    def create(self, validated_data):
        # Извлекаем данные о контакте
        contact_data = validated_data.pop('contact')

        # Создаем контакт или получаем существующий
        contact_serializer = ContactSerializer(data=contact_data)
        contact_serializer.is_valid(raise_exception=True)
        contact = contact_serializer.save()  # Сохраняем контакт


        property_type = validated_data.pop('property_type')
        extra_fields = validated_data.pop('extra_fields', {})

        # Распаковываем вложенный price
        price_data = validated_data.pop('price', {})
        validated_data['price_value'] = price_data.get('value')
        validated_data['price_currency'] = price_data.get('currency')

        # Объединяем все данные
        combined_data = {**validated_data, **extra_fields, 'contact': contact.id}

        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            raise serializers.ValidationError(f"Unsupported property type: {property_type}")

        serializer = serializer_class(data=combined_data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def update(self, instance, validated_data):
        contact_data = validated_data.pop('contact', None)
        if contact_data:
            contact_serializer = ContactSerializer(instance.contact, data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact_serializer.save()

        price_data = validated_data.pop('price', {})
        validated_data['price_value'] = price_data.get('value', instance.price_value)
        validated_data['price_currency'] = price_data.get('currency', instance.price_currency)

        extra_fields = validated_data.pop('extra_fields', {})

        # Список запрещенных для прямого изменения атрибутов
        forbidden_fields = ['property_type', 'id']

        for attr, value in {**validated_data, **extra_fields}.items():
            if attr in forbidden_fields:
                continue  # пропускаем поля, которые нельзя менять напрямую
            setattr(instance, attr, value)

        instance.save()
        return instance


    def to_representation(self, instance):
        # возвращаем, как сериализует конкретный сериализатор
        for property_type, serializer_class in PROPERTY_SERIALIZER_MAP.items():
            if isinstance(instance, serializer_class.Meta.model):
                return serializer_class(instance).data
        return super().to_representation(instance)

