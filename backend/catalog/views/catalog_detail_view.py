from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from catalog.serializers.catalog_serializer import CatalogCreateSerializer
from catalog.views.catalog_list_view import PROPERTY_MODEL_MAP
from catalog.interfaces.property_response import format_property
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Этот класс отвечает за получение, обновление и изменение данных об объектах недвижимости
# Он использует сериализатор CatalogCreateSerializer для валидации и сохранения данных

class CatalogDetailView(APIView):
    # 🔹 Используем JWT для аутентификации
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

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
    
    # GET - получение данных об объекте
    def get(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(format_property(instance))

    # PUT - обновление данных об объекте
    def put(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CatalogCreateSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_instance = serializer.save()
        return Response(format_property(updated_instance))

    # PATCH - изменение статуса объекта
    def patch(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")
        if not status_value:
            return Response({"detail": "Missing 'status' field."}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.save()

        return Response(format_property(instance), status=status.HTTP_200_OK)

