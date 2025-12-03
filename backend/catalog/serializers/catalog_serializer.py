# catalog/serializers/catalog_serializer.py
import logging
from colorama import init, Fore
from file.file_utils import make_files_permanent
from rest_framework import serializers
from .flat_serializer import FlatSerializer
from contacts.contact_serializers import ContactSerializer
from .catalog_address_serializer import AddressSerializer
from .catalog_price_serializer import PriceSerializer 
from contacts.models import Contact

init()
logger = logging.getLogger(__name__)

PROPERTY_SERIALIZER_MAP = { # TODO: Добавить другие типы 
    'flat': FlatSerializer,
}

def prepare_property_data(validated_data):
    """Возвращает распарсенные поля, готовые к применению к модели"""
    specifics = validated_data.pop('specifics', {}) or {}

    options = specifics.get("options", {}) or {}
    shared_facilities = options.get("shared_facilities", {}) or {}
    utilities = options.get("utilities", {}) or {}
    other = options.get("other", {}) or {}

    # Общие поля
    data = {
        "rooms": specifics.get("rooms"),
        "floor_current": specifics.get("floor", {}).get("current"),
        "floor_full": specifics.get("floor", {}).get("full"),
        "kitchen_type": specifics.get("kitchen"),
        "heating": specifics.get("heating"),
        "furnished": specifics.get("furnished"),
        "renovation": specifics.get("renovation"),
        # Shared Facilities
        "shared_kitchen": shared_facilities.get("shared_kitchen", False),
        "shared_bathroom": shared_facilities.get("shared_bathroom", False),
        # Utilities
        "electricity": utilities.get("electricity", False),
        "water_supply": utilities.get("water_supply", False),
        "natural_gas": utilities.get("natural_gas", False),
        "sewerage": utilities.get("sewerage", False),
        "internet": utilities.get("internet", False),
        # Other
        "bath": other.get("bath", False),
        "shower": other.get("shower", False),
        "air_conditioning": other.get("air_conditioning", False),
        "fireplace": other.get("fireplace", False),
        "beautiful_view": other.get("beautiful_view", False),
        "new_building": other.get("new_building", False),
        "elevator": other.get("elevator", False),
        "parking": other.get("parking", False),
        "balcony": other.get("balcony", False),
        "garden": other.get("garden", False),
        "garage": other.get("garage", False),
    }

    return data


class CatalogCreateSerializer(serializers.Serializer):
    # Поля из BaseProperty общие для всех, плюс специфичные
    property_type = serializers.ChoiceField(choices=list(PROPERTY_SERIALIZER_MAP.keys()))
    zoning_type = serializers.ChoiceField(choices=['residential', 'commercial', 'agricultural', 'mixed'], required=True, allow_null=False)
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

    # === СОЗДАНИЕ ОБЪЕКТА ===
    def create(self, validated_data):
        logger.info("=== [CREATE PROPERTY] Получена команда на создание объекта... ===")
        logger.info(f"Validated data: {validated_data}")

        photos = validated_data.pop('photos', [])
        property_type = validated_data.pop('property_type')
        contact_data = validated_data.pop('contact', None)
        price_data = validated_data.pop('price', {})
        address_data = validated_data.pop('address', {})

        # Подготавливаем поля из specifics и остальных данных
        combined_data = prepare_property_data(validated_data)

        # Добавляем контакт
        contact = None
        if contact_data:
            contact_serializer = ContactSerializer(data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()
            combined_data["contact"] = contact.id

        # Добавляем price и address
        combined_data["price_value"] = price_data.get("value")
        combined_data["price_currency"] = price_data.get("currency")
        combined_data["address"] = address_data

        # Создаём объект нужного типа
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            raise serializers.ValidationError({"property_type": "Invalid type"})

        inner_serializer = serializer_class(data=combined_data)
        inner_serializer.is_valid(raise_exception=True)
        instance = inner_serializer.save()

        # Работа с фото
        if photos:
            new_photos = [make_files_permanent(url, subdir=f'property_{instance.id}') for url in photos]
            instance.photos = new_photos
            instance.save(update_fields=["photos"])

        logger.info(f"=== [CREATE PROPERTY] Done. ID={instance.id} ===")
        return instance


    # === ОБНОВЛЕНИЕ ОБЪЕКТА ===
    def update(self, instance, validated_data):
        print("=== [UPDATE PROPERTY] Начало обновления ===")
        print("validated_data:", validated_data)

        # Контакт
        contact_data = validated_data.pop('contact', None)
        if contact_data:
            existing_contact = Contact.objects.filter(
                name=contact_data.get("name"),
                phone=contact_data.get("phone")
            ).first()

            if existing_contact:
                instance.contact = existing_contact
            else:
                if instance.contact:
                    contact_serializer = ContactSerializer(instance=instance.contact, data=contact_data, partial=True)
                else:
                    contact_serializer = ContactSerializer(data=contact_data)
                contact_serializer.is_valid(raise_exception=True)
                instance.contact = contact_serializer.save()

        # Цена
        price_data = validated_data.pop('price', {})
        if price_data:
            instance.price_value = price_data.get('value', instance.price_value)
            instance.price_currency = price_data.get('currency', instance.price_currency)

        # Адрес (можно через сериализатор, если нужен)
        address_data = validated_data.pop('address', None)
        if address_data:
            instance.address.update(address_data)

        # Подготавливаем остальные поля через функцию
        combined_data = prepare_property_data(validated_data)
        for attr, value in combined_data.items():
            setattr(instance, attr, value)

        # Работа с фото
        new_photos_from_front = validated_data.pop("photos", None)
        if new_photos_from_front is not None:
            old_photos = instance.photos or []
            photos_to_keep = [p for p in new_photos_from_front if p in old_photos]
            temporary_new_photos = [p for p in new_photos_from_front if p not in old_photos]
            processed_new_photos = [make_files_permanent(url, subdir=f'property_{instance.id}') for url in temporary_new_photos]
            final_photos = photos_to_keep + processed_new_photos
            instance.photos = final_photos
            print(Fore.YELLOW + f"Updated photos. Kept: {photos_to_keep}, Added: {processed_new_photos}" + Fore.RESET)

        instance.save()
        print(f"=== [UPDATE PROPERTY] Done. ID={instance.id} ===")
        return instance

