from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from catalog.serializers.catalog_serializer import CatalogCreateSerializer
from catalog.interfaces.property_response import format_property

class PropertyCreateView(generics.CreateAPIView):
    # 🔹 Используем JWT для аутентификации
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CatalogCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Создаём объект (внутри сериализатора уже обрабатываются фото)
        property_obj = serializer.save()

        # Формируем структурированный ответ
        response_data = format_property(property_obj)

        return Response(response_data, status=status.HTTP_201_CREATED)
