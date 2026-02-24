from colorama import init, Fore
from file.file_utils import make_files_permanent
from rest_framework import serializers
from contacts.contact_serializers import ContactIDField
from contacts.models import Contact
from .catalog_address_serializer import AddressSerializer
from .catalog_price_serializer import PriceSerializer 
from realtor.settings import MAX_FILES
from django.db import transaction

init()

# Базовый сериализатор для создания/обновления объектов недвижимости
class BaseCreateUpdateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    property_type = serializers.ReadOnlyField()
    address = AddressSerializer()               
    price = PriceSerializer()
    contact = ContactIDField(
        queryset=Contact.objects.all(),
        required=False,      
        allow_null=True     
    )

    class Meta:
        model = None
        fields = [
            'property_type', 'name', 'status', 'photos', 'address', 'zoning_type',
            'price', 'area','contact', 'comment','date_added', 'user',
        ]
        read_only_fields = ['date_added', 'user']

    # ВАЛИДАЦИЯ КОЛИЧЕСТВА ФОТО
    def validate_photos(self, value):
        if len(value) > MAX_FILES:
            raise serializers.ValidationError(
                f"TOO_MANY_FILES. MAX_ALLOWED_IS_{MAX_FILES}."
            )
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        print(Fore.YELLOW + "=== Initiating Creating Property... ===" + Fore.RESET)
        print(f"Validated data: {validated_data}")

        # Извлекаем вложенные данные
        photos = validated_data.pop('photos', [])
        price_data = validated_data.pop('price')
        address_data = validated_data.pop('address', {})

        # создаём основной объект
        instance = self.Meta.model.objects.create(
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

    @transaction.atomic
    def update(self, instance, validated_data):
        print(Fore.YELLOW + "=== Initiating Updating Property... ===" + Fore.RESET)
        print(f"Validated data: {validated_data}")

        # === Работа с вложенными данными ===
        # contact_data = validated_data.pop('contact', None)
        price_data = validated_data.pop('price', None)
        address_data = validated_data.pop('address', None)

        # Обновляем адрес
        if address_data:
            instance.address = address_data

        # Обновляем цену
        if price_data:
            instance.price_value = price_data.get('value', instance.price_value)
            instance.price_currency = price_data.get('currency', instance.price_currency)

        # Обновляем остальные поля
        for attr, value in validated_data.items():
            if attr != 'photos':  # фото обработаем отдельно
                setattr(instance, attr, value)

        instance.save()

        # === Работа с фото ===
        new_photos_from_front = validated_data.get("photos", None)

        if new_photos_from_front is not None:
            old_photos = instance.photos or []

            # Фото, которые оставляем
            photos_to_keep = [p for p in new_photos_from_front if p in old_photos]

            # Новые временные фото
            temporary_new_photos = [p for p in new_photos_from_front if p not in old_photos]

            # Превращаем новые временные в постоянные
            processed_new_photos = [make_files_permanent(url) 
                                    for url in temporary_new_photos]

            # Итоговый список
            final_photos = photos_to_keep + processed_new_photos

            instance.photos = final_photos
            instance.save(update_fields=['photos'])

        print(Fore.GREEN + "=== Property updated successfully ===" + Fore.RESET)
        print(f"Updated instance: {instance}")
        return instance


