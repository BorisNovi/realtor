from colorama import init, Fore
from file.file_utils import make_files_permanent
from rest_framework import serializers
from contacts.contact_serializers import ContactSerializer
from .catalog_address_serializer import AddressSerializer
from .catalog_price_serializer import PriceSerializer 
from contacts.models import Contact
from realtor.settings import MAX_FILES
from django.db import transaction

init()

# Базовый сериализатор для создания/обновления объектов недвижимости
class BaseCreateUpdateSerializer(serializers.ModelSerializer):
    property_type = serializers.ReadOnlyField() # Виртуальное поле из модели
    address = AddressSerializer()               
    contact = ContactSerializer()
    price = PriceSerializer()

    class Meta:
        model = None
        fields = [
            'property_type', 'status', 'photos', 'address', 'zoning_type',
            'price', 'area','contact', 'comment','date_added',
        ]

    # ВАЛИДАЦИЯ КОЛИЧЕСТВА ФОТО
    def validate_photos(self, value):
        if len(value) > MAX_FILES:
            raise serializers.ValidationError(
                f"Too many photos. Max allowed is {MAX_FILES}."
            )
        return value
    
    @transaction.atomic # Обеспечивает атомарность операции, чтобы избежать частичного создания данных
    def create(self, validated_data):
        print(Fore.YELLOW + "=== Initiating Creating Property... ===" + Fore.RESET)
        print(f"Validated data: {validated_data}")

        # ✅ Извлекаем вложенные данные
        photos = validated_data.pop('photos', [])
        contact_data = validated_data.pop('contact', None)
        price_data = validated_data.pop('price')
        address_data = validated_data.pop('address', {})

        # создаём вложенные объекты
        contact = Contact.objects.create(**contact_data) if contact_data else None

        # создаём основной объект
        instance = self.Meta.model.objects.create(
            contact=contact,
            address=address_data,
            price_value=price_data.get('value'),
            price_currency=price_data.get('currency'),
            **validated_data
        )

        # Делаем файлы постоянными и связываем с объектом
        if photos:
            new_photos = [make_files_permanent(url) for url in photos]
            instance.photos = new_photos
            instance.save(update_fields=['photos'])

        print(Fore.GREEN + "=== Property created successfully ===" + Fore.RESET)
        print(f"Created instance: {instance}")
        return instance



