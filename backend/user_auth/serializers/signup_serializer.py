from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirmation', 'name', 'company_name', 'company_logo')

    def validate_email(self, value):
        """Проверка email — уникальность и базовый формат."""
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise ValidationError("Пользователь с таким email уже существует")
        return value

    def validate(self, attrs):
        """Проверка совпадения паролей и стандартные Django-парольные проверки."""
        password = attrs.get('password')
        password_confirmation = attrs.pop('password_confirmation', None)

        if password != password_confirmation:
            raise ValidationError({'password_confirmation': 'Пароли не совпадают'})

        # Стандартные проверки безопасности Django (длина, цифры, спецсимволы, common passwords и т.д.)
        validate_password(password)

        return attrs

    def create(self, validated_data):
        """Создаём пользователя через менеджер."""
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user
