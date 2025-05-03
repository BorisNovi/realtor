from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    def validate_email(self, value):
        # Проверка на уникальность email
        if User.objects.filter(email=value).exists():
            raise ValidationError("Пользователь с таким email уже существует")

        # Дополнительная проверка формата (если нужно ограничить допустимые email)
        # Пример: только буквы, цифры, точки и дефисы в имени email
        if not re.match(r'^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValidationError("Недопустимый формат email")

        return value

    def validate_password(self, value):
        # Проверка длины пароля
        if len(value) < 8:
            raise ValidationError("Пароль должен быть не менее 8 символов")
        # Проверка на наличие заглавной буквы
        if not re.search(r'[A-Z]', value):
            raise ValidationError("Пароль должен содержать хотя бы одну заглавную букву")
        # Проверка на наличие цифры
        if not re.search(r'\d', value):
            raise ValidationError("Пароль должен содержать хотя бы одну цифру")
        # Проверка на наличие специального символа
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError("Пароль должен содержать хотя бы один специальный символ")
        return value

    def validate(self, data):
        # Проверка совпадения паролей
        if data['password'] != data['password_confirmation']:
            raise ValidationError({
                'password': 'Пароли не совпадают',
                'password_confirmation': 'Пароли не совпадают'
            })
        return data

    def create(self, validated_data):
        # Здесь больше не создаём пользователя, так как это будет сделано в `sign-up-activate`
        return validated_data