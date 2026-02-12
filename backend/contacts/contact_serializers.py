# contacts/serializers.py
from rest_framework import serializers
from contacts.models import Contact
import re

# Чтобы можно было передавать только ID контакта во вложенном виде
class ContactIDField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if isinstance(data, dict) and 'id' in data:
            data = data['id']
        return super().to_internal_value(data)


class ContactSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Contact
        fields = ['id', 'dateAdded', 'name', 'phone', 'additional_phone', 'comment', 'user']
        read_only_fields = ['id', 'dateAdded', 'user']

    # Валидация полей контакта
    def validate_name(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("Максимум 50 символов.")
        return value

    def validate_phone(self, value):
        if not re.fullmatch(r'\d+', value):
            raise serializers.ValidationError("Телефон должен содержать только цифры.")
        return value

    def validate_additional_phone(self, value):
        if value and not re.fullmatch(r'\d+', value):
            raise serializers.ValidationError("Телефон должен содержать только цифры.")
        return value

    def validate_comment(self, value):
        if value and len(value) > 200:
            raise serializers.ValidationError("Максимум 200 символов.")
        return value

    def validate(self, attrs):
        phone = attrs.get('phone')
        name = attrs.get('name')
        user = self.context['request'].user

        instance = getattr(self, 'instance', None)

        # Ищем контакт ТОЛЬКО у текущего пользователя
        qs = Contact.objects.filter(phone=phone, user=user)

        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            existing = qs.first()
            
            if not instance:  # создание
                raise serializers.ValidationError({
                    "phone": f"Такой контакт уже существует в вашем списке ('{existing.name}')"
                })
            
            # при обновлении — просто запрещаем дубли (можно смягчить, если нужно)
            raise serializers.ValidationError({
                "phone": "Этот номер уже используется в ваших контактах."
            })

        return attrs


    # Создание контакта, если его не было, или возвращение существующего
    def create(self, validated_data):
        return Contact.objects.create(**validated_data)

    # Обновление контакта с проверкой уникальности по номеру телефона
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
        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        return instance