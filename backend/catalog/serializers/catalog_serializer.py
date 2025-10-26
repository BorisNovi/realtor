import logging
from rest_framework import serializers
from .flat_serializer import FlatSerializer
from .office_serializer import OfficeSerializer
from .land_serializer import LandPlotSerializer
from contacts.serializers import ContactSerializer
from .address_serializer import AddressSerializer
from catalog.parsers.specifics_parser import flatten_specifics
from file.utils import make_files_permanent


logger = logging.getLogger(__name__)

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
    photos = serializers.ListField(child=serializers.CharField(), required=False)
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
        logger.info("=== [CREATE PROPERTY] Start ===")

        photos = validated_data.pop('photos', [])
        property_type = validated_data.pop('property_type')
        contact_data = validated_data.pop('contact', None)
        price_data = validated_data.pop('price', {})
        address_data = validated_data.pop('address', {})
        specifics = validated_data.pop('specifics', {})
        extra_fields = validated_data.pop('extra_fields', {})

        # Обработка contact
        contact = None
        if contact_data:
            logger.debug("Создание контакта...")
            contact_serializer = ContactSerializer(data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()
            logger.debug(f"Контакт создан: {contact}")

        # Преобразуем specifics
        specifics_flat = flatten_specifics(property_type, specifics)
        logger.debug(f"Сформированы specifics_flat: {specifics_flat}")

        # Собираем данные
        combined_data = {
            **extra_fields,
            **validated_data,
            **specifics_flat,
            "price_value": price_data.get("value"),
            "price_currency": price_data.get("currency"),
            "address": address_data,
        }
        if contact is not None:
            combined_data["contact"] = contact.id

        logger.info("=== [CREATE PROPERTY] combined_data ===")
        for k, v in combined_data.items():
            logger.info(f"{k}: {v} ({type(v)})")

        # Создаём объект нужного типа
        serializer_class = PROPERTY_SERIALIZER_MAP[property_type]
        inner_serializer = serializer_class(data=combined_data)

        if not inner_serializer.is_valid():
            logger.error(f"🔥 Ошибка сериализатора {serializer_class.__name__}: {inner_serializer.errors}")
            raise serializers.ValidationError(inner_serializer.errors)

        instance = inner_serializer.save()

        # Перемещаем файлы
        if photos:
            logger.debug(f"Перемещение {len(photos)} фото...")
            new_photos = []
            for url in photos:
                new_url = make_files_permanent(url, subdir=f'property_{instance.id}')
                new_photos.append(new_url)
                logger.debug(f"Файл перемещён: {url} → {new_url}")

            instance.photos = new_photos
            instance.save(update_fields=["photos"])
            logger.info(f"Фотографии сохранены: {new_photos}")

        logger.info(f"=== [CREATE PROPERTY] Done. ID={instance.id} ===")
        return instance


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
        property_type = getattr(instance, 'property_type', None)
        specifics_flat = flatten_specifics(property_type, specifics)

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
