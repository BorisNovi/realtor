from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth import authenticate 
from rest_framework_simplejwt.tokens import RefreshToken 
from django.contrib.auth import get_user_model

User = get_user_model()

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
                    "id": user.id,  
                    "name": user.name,  
                    "email": user.email, 
                    "role": user.role, 
                    "insertedAt": user.insertedAt.isoformat(), 
                    "bannedAt": user.banned.isoformat() if user.banned else None
                }
        }
