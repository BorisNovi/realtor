from rest_framework import serializers
from contacts.models import Contact
import re

# Адаптер для обработки входящих данных, которые могут быть в виде словаря с ключом 'id' или просто числом
class ContactIDField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if isinstance(data, dict) and 'id' in data:
            data = data['id']
        return super().to_internal_value(data)

class UserFromContextDefault:
    requires_context = True

    def __call__(self, serializer_field):
        context = serializer_field.context
        if 'user' in context:
            return context['user']
        return context['request'].user

class ContactSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    user = serializers.HiddenField(default=UserFromContextDefault())

    class Meta:
        model = Contact
        fields = ['id', 'dateAdded', 'name', 'phone', 'additional_phone', 'comment', 'user']
        read_only_fields = ['id', 'dateAdded', 'user']

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
        user = self.context.get('user') or self.context['request'].user

        instance = getattr(self, 'instance', None)

        # Ищем контакт ТОЛЬКО у текущего пользователя
        qs = Contact.objects.filter(phone=phone, user=user)

        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            existing = qs.first()
            
            if not instance: 
                raise serializers.ValidationError({"error": "CONTACT_ALREADY_EXISTS"})
            
            raise serializers.ValidationError({
                "error": "PHONE_ALREADY_USED_BY_ANOTHER_CONTACT"
            })

        return attrs

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
                    {"error": "PHONE_ALREADY_USED_BY_ANOTHER_CONTACT"}
                )

        # Обновляем поля, если они переданы, иначе оставляем старые
        instance.name = validated_data.get('name', instance.name)
        instance.phone = new_phone
        instance.additional_phone = validated_data.get('additional_phone', instance.additional_phone)
        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        return instance