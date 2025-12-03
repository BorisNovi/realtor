from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from catalog.serializers.catalog_serializer import CatalogCreateSerializer, PROPERTY_SERIALIZER_MAP
from catalog.views.catalog_list_view import PROPERTY_MODEL_MAP
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Вьюха для одного объекта недвижимости
class CatalogDetailView(APIView):
    """Отвечает за получение и обновление объектов недвижимости по их первичному ключу (pk)."""

    # 🔹 Используем JWT для аутентификации
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    # Получает объект недвижимости по первичному ключу (pk)
    # Позволяет обновлять его данные и изменять статус
    def get_instance(self, pk):
        for model in PROPERTY_MODEL_MAP.values():
            try:
                return model.objects.get(pk=pk, deleted_at__isnull=True)
            except model.DoesNotExist:
                continue
        return None

    # Методы для работы с объектами недвижимости
    
    # GET - получение данных
    def get(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Универсальная отдача через соответствующий сериализатор
        property_type = getattr(instance, 'property_type', None)
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"detail": "Serializer not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = serializer_class(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PUT - обновление объекта
    def put(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CatalogCreateSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_instance = serializer.save()

        # Отдаём объект в формате IPropertyObject через соответствующий сериализатор
        property_type = getattr(updated_instance, 'property_type', None)
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        serializer = serializer_class(updated_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PATCH - частичное обновление (например, только статус)
    def patch(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")
        if not status_value:
            return Response({"detail": "Missing 'status' field."}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.save()

        property_type = getattr(instance, 'property_type', None)
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        serializer = serializer_class(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

