# user_auth/serializers/signin_serializer.py
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("Пользователь с таким email не найден")

        user = authenticate(username=user.email, password=password)
        if user is None:
            raise serializers.ValidationError("Неверный логин или пароль")

        # Сохраняем юзера для вьюхи
        data["user"] = user

        # Генерация JWT, если нужно
        refresh = RefreshToken.for_user(user)
        data["accessToken"] = str(refresh.access_token)
        data["refreshToken"] = str(refresh)

        return data
