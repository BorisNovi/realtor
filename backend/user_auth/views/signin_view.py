# user_auth/views/signin_view.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import SigninSerializer
from rest_framework.views import APIView
from rest_framework import status, permissions, authentication

class SigninView(APIView):
    authentication_classes = []  # <- отключаем проверку токена
    permission_classes = [permissions.AllowAny]  # <- любой может вызвать

    def post(self, request):
        serializer = SigninSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)