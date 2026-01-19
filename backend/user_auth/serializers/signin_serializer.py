# user_auth/serializers/signin_serializer.py

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = User.objects.filter(email=data["email"]).first()
        if not user:
            raise serializers.ValidationError("Пользователь не найден")

        user = authenticate(username=user.email, password=data["password"])
        if not user:
            raise serializers.ValidationError("Неверный логин или пароль")

        refresh = RefreshToken.for_user(user)

        data["user"] = user
        data["accessToken"] = str(refresh.access_token)
        data["refreshToken"] = str(refresh)

        return data
