# listings/views.py
import json
import re
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from listings.serializers import ListingSerializer

# Контроллер для листингов с поддержкой создания листинга
class ListingsView(APIView):
    authentication_classes = [JWTAuthentication]  
    permission_classes = [permissions.IsAuthenticated]

    # Создание нового листинга ../listing/
    def post(self, request):
        serializer = ListingSerializer(data=request.data) # Объявляем сериализатор с входными данными 
        if serializer.is_valid(): # Проверяем валидность данных
            serializer.save() # Сохраняем новый листинг в БД
            return Response(serializer.data, status=status.HTTP_201_CREATED)  # Возвращаем созданный листинг с кодом 201
        return Response(serializer.errors, status=400) # Возвращаем ошибки валидации с кодом 400
    