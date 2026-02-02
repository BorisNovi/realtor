# catalog/views.py
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from catalog.serializers.flat_create_update_serializer import (
    FlatCreateUpdateSerializer,
    FlatReadSerializer
) # TODO: импортировать другие типы недвижимости и их сериализаторы


# Словарь для динамического выбора сериализатора по propertyType
PROPERTY_WRITE_SERIALIZER_MAP = {
    "flat": FlatCreateUpdateSerializer,
    # "house": HouseCreateUpdateSerializer,
    # "garage": GarageCreateUpdateSerializer,
}

PROPERTY_READ_SERIALIZER_MAP = {
    "flat": FlatReadSerializer,
    # "house": HouseReadSerializer,
    # "garage": GarageReadSerializer,
}


class PropertyObjectAPIView(APIView):
    """Универсальный эндпоинт для работы с объектами недвижимости."""
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("Incoming data:", request.data)
        
        property_type = request.data.get("propertyType") or request.data.get("property_type")
        if not property_type:
            return Response({"error": "propertyType is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"error": f"Unknown propertyType {property_type}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Отдаём фронту через read-сериализатор
        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[property_type]
        read_serializer = read_serializer_class(instance)
        
        print("Response data:", read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    # def put(self, request, pk):
    #     """
    #     Обновление объекта. Нужно указать id в URL.
    #     """
    #     property_type = request.data.get("propertyType")
    #     if not property_type:
    #         return Response({"error": "propertyType is required"}, status=status.HTTP_400_BAD_REQUEST)

    #     serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(property_type)
    #     if not serializer_class:
    #         return Response({"error": f"Unknown propertyType {property_type}"}, status=status.HTTP_400_BAD_REQUEST)

    #     # Подгружаем объект по pk
    #     # TODO: по-хорошему, нужно выбирать модель по propertyType
    #     # Для примера: если flat
    #     instance = get_object_or_404(Flat, pk=pk)

    #     serializer = serializer_class(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     instance = serializer.save()

    #     read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[property_type]
    #     read_serializer = read_serializer_class(instance)
    #     return Response(read_serializer.data, status=status.HTTP_200_OK)
