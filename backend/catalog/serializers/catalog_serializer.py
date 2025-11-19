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

PROPERTY_SERIALIZER_MAP = {
    'flat': FlatSerializer,
}

class CatalogCreateSerializer(serializers.Serializer):
    # Поля из BaseProperty
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

    def create(self, validated_data):
        logger.info("=== [CREATE PROPERTY] Start ===")
        logger.info(f"Validated data: {validated_data}")

        photos = validated_data.pop('photos', [])
        zoning_type = validated_data.pop('zoning_type')
        property_type = validated_data.pop('property_type')
        contact_data = validated_data.pop('contact', None)
        price_data = validated_data.pop('price', {})
        address_data = validated_data.pop('address', {})
        specifics = validated_data.pop('specifics', {})

        # Извлечение вложенных данных
        options = specifics.get("options", {})
        shared_facilities = options.get("shared_facilities", {})  # Исправлено с sharedFacilities!!! Ломалась десериализация.
        utilities = options.get("utilities", {})
        other = options.get("other", {})

        # Обработка контакта
        contact = None
        if contact_data:
            contact_serializer = ContactSerializer(data=contact_data)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()

        # Формируем данные для модели
        combined_data = {
            **validated_data,
            "zoning_type": zoning_type,
            "price_value": price_data.get("value"),
            "price_currency": price_data.get("currency"),
            "address": address_data,
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
            "water_supply": utilities.get("water_supply", False),  # Исправлено с waterSupply
            "natural_gas": utilities.get("natural_gas", False),  # Исправлено с naturalGas
            "sewerage": utilities.get("sewerage", False),
            "internet": utilities.get("internet", False),
            # Other
            "bath": other.get("bath", False),
            "shower": other.get("shower", False),
            "air_conditioning": other.get("air_conditioning", False),  # Исправлено с airConditioning
            "fireplace": other.get("fireplace", False),
            "beautiful_view": other.get("beautiful_view", False),  # Исправлено с beautifulView
            "new_building": other.get("new_building", False),  # Исправлено с newBuilding
            "elevator": other.get("elevator", False),
            "parking": other.get("parking", False),
            "balcony": other.get("balcony", False),
            "garden": other.get("garden", False),
            "garage": other.get("garage", False),
        }

        logger.info(f"Combined data: {combined_data}")

        if contact is not None:
            combined_data["contact"] = contact.id

        # Создаём объект нужного типа
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            raise serializers.ValidationError({"property_type": "Invalid type"})

        inner_serializer = serializer_class(data=combined_data)
        inner_serializer.is_valid(raise_exception=True)
        instance = inner_serializer.save()

        # Перемещаем фото
        if photos:
            new_photos = []
            for url in photos:
                new_url = make_files_permanent(url, subdir=f'property_{instance.id}')
                new_photos.append(new_url)
            instance.photos = new_photos
            instance.save(update_fields=["photos"])

        logger.info(f"=== [CREATE PROPERTY] Done. ID={instance.id} ===")
        return instance

    def update(self, instance, validated_data):
        # Контакт
        print("=== UPDATE PROPERTY START ===")
        print("validated_data:", validated_data)

        # Забираем данные контакта
        contact_data = validated_data.pop('contact', None)
        print("contact_data:", contact_data)

        if contact_data:
            new_name = contact_data.get("name")
            new_phone = contact_data.get("phone")

            print("Requested contact name:", new_name)
            print("Requested contact phone:", new_phone)

            # Пытаемся найти существующий контакт
            existing_contact = Contact.objects.filter(
                name=new_name,
                phone=new_phone
            ).first()

            print("existing_contact:", existing_contact)

            if existing_contact:
                print("=== FOUND EXISTING CONTACT, REASSIGNING ===")
                instance.contact = existing_contact

            else:
                print("=== NO EXISTING CONTACT FOUND, UPDATING CURRENT ===")

                # Если текущего контакта нет – создаём новый
                if instance.contact:
                    contact_serializer = ContactSerializer(
                        instance=instance.contact,
                        data=contact_data,
                        partial=True
                    )
                else:
                    contact_serializer = ContactSerializer(
                        data=contact_data
                    )

                contact_serializer.is_valid(raise_exception=True)
                new_contact = contact_serializer.save()
                instance.contact = new_contact

        # Цена
        price_data = validated_data.pop('price', {})
        if price_data:
            instance.price_value = price_data.get('value', instance.price_value)
            instance.price_currency = price_data.get('currency', instance.price_currency)

        # Остальные поля
        specifics = validated_data.pop('specifics', {})
        for attr, value in {**validated_data, **specifics}.items():
            if attr not in ['property_type', 'id', 'photos']:
                setattr(instance, attr, value)

        # Фото оставляем без изменений на этом этапе
        instance.save()
        return instance
