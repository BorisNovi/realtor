from rest_framework import serializers
from django.contrib.auth.models import User  # или модель пользователя, если кастомная

from django.contrib.auth import authenticate # Либа для аутентикации
from rest_framework_simplejwt.tokens import RefreshToken # Работа с токенами

class SignupSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2']  # Добавил поле username
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают")
        if len(data['password']) < 8:
            raise serializers.ValidationError("Пароль должен быть не менее 8 символов")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],  # Добавлен username
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = User.objects.filter(email=email).first()
        if user is None:
            raise serializers.ValidationError("Пользователь с таким email не найден")

        user = authenticate(username=user.username, password=password)
        if user is None:
            raise serializers.ValidationError("Неверный пароль")

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
