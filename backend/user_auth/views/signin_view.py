# user_auth/views/signin_view.py
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers.signin_serializer import SigninSerializer
from user_auth.models import UserSession
from django.utils import timezone
from django.contrib.auth import login

class SigninView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SigninSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Возвращаем токены и инфу, если нужно фронту
        return Response({
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "insertedAt": user.insertedAt.isoformat(),
                "bannedAt": user.banned.isoformat() if user.banned else None
            },
            "accessToken": serializer.validated_data["accessToken"],
            "refreshToken": serializer.validated_data["refreshToken"]
        }, status=200)
