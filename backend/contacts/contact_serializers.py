# contacts/serializers.py
from rest_framework import serializers
from contacts.models import Contact
from rest_framework import serializers
from .models import Contact
import re

class ContactSerializer(serializers.ModelSerializer):
    dateAdded = serializers.DateTimeField(read_only=True, format="%Y-%m-%dT%H:%M:%SZ")

    class Meta:
        model = Contact
        fields = ['id', 'dateAdded', 'name', 'phone', 'additional_phone']

    def validate_name(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("Name must be at most 50 characters long.")
        return value

    def validate_phone(self, value):
        if not re.match(r'^\d+$', value):
            raise serializers.ValidationError("Phone number must contain only digits.")
        return value

    def validate_additional_phone(self, value):
        if value and not re.match(r'^\d+$', value):
            raise serializers.ValidationError("Additional phone number must contain only digits.")
        return value

    def create(self, validated_data):
        phone = validated_data.get('phone')
        name = validated_data.get('name')

        try:
            # Ищем существующий контакт по номеру
            existing_contact = Contact.objects.get(phone=phone)
            if existing_contact.name != name:
                # Если имя не совпадает — ошибка
                raise serializers.ValidationError(
                    f"Phone {phone} is already assigned to contact '{existing_contact.name}'."
                )
            # Если совпадает — возвращаем существующий контакт
            return existing_contact
        except Contact.DoesNotExist:
            # Создаём новый контакт
            return Contact.objects.create(**validated_data)

    def update(self, instance, validated_data):
        new_phone = validated_data.get('phone', instance.phone)

        # Если пытаемся обновить номер телефона, проверяем его уникальность
        # и если он уже используется другим контактом, выбрасываем ошибку 
        if new_phone != instance.phone:
            if Contact.objects.filter(phone=new_phone).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError(
                    f"Phone number {new_phone} is already used by another contact."
                )

        # Обновляем поля, если они переданы, иначе оставляем старые
        instance.name = validated_data.get('name', instance.name)
        instance.phone = new_phone
        instance.additional_phone = validated_data.get('additional_phone', instance.additional_phone)
        instance.save()
        return instance