from rest_framework import serializers
from user_auth.models import User

from django.contrib.auth import authenticate # Либа для аутентикации
from rest_framework_simplejwt.tokens import RefreshToken # Работа с токенами

class SignupSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirmation']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError("Пароли не совпадают")
        if len(data['password']) < 8:
            raise serializers.ValidationError("Пароль должен быть не менее 8 символов")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
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

        user = authenticate(username=user.email, password=password)
        if user is None:
            raise serializers.ValidationError("Неверный логин или пароль")

        refresh = RefreshToken.for_user(user)
        return {
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh),
                "user": {
                    "id": user.id,  # ID пользователя
                    "name": user.name,  # Имя пользователя
                    "email": user.email,  # Почта пользователя
                    "role": user.role,  # Роль пользователя
                    "insertedAt": user.insertedAt.isoformat(),  # Дата регистрации
                    "bannedAt": user.banned.isoformat() if user.banned else None  # Дата бана (если есть)
                }
        }
