# catalog/views.py
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from catalog.catalog_models import Property
from catalog.serializers.flat_create_update_serializer import (
    FlatCreateUpdateSerializer,
    FlatReadSerializer
)
from catalog.serializers.house_create_update_serializer import (
    HouseCreateUpdateSerializer, 
    HouseReadSerializer
) 
from catalog.serializers.room_create_update_serializer import (
    RoomCreateUpdateSerializer, 
    RoomReadSerializer
) 
from catalog.serializers.office_create_update_serializer import (
    OfficeCreateUpdateSerializer, 
    OfficeReadSerializer
) 
from catalog.serializers.land_create_update_serializer import (
    LandCreateUpdateSerializer, 
    LandReadSerializer
) 


# Словари для динамического выбора сериализатора по propertyType
# Для записи (создание/обновление)
PROPERTY_WRITE_SERIALIZER_MAP = {
    "flat": FlatCreateUpdateSerializer,
    "house": HouseCreateUpdateSerializer,
    "room": RoomCreateUpdateSerializer,
    "office": OfficeCreateUpdateSerializer,
    "land": LandCreateUpdateSerializer,
}

# Для чтения (возврат данных фронту)
PROPERTY_READ_SERIALIZER_MAP = {
    "flat": FlatReadSerializer,
    "house": HouseReadSerializer,
    "room": RoomReadSerializer,
    "office": OfficeReadSerializer,
    "land": LandReadSerializer,
}


class PropertyObjectAPIView(APIView):
    """Универсальный эндпоинт для работы с объектами недвижимости."""
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    # Вспомогательный метод для получения объекта по pk
    def _get_property_instance(self, pk):
        """
        Возвращает объект Property (или дочерний) по pk.
        404, если не найден или is_deleted=True.
        """
        instance = get_object_or_404(
            Property.objects.all(),
            pk=pk,
            is_deleted=False
        )
        return instance.get_real_instance()

    # POST - создание нового объекта
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

    # GET - получение данных
    def get(self, request, pk):
        print("Requested pk:", pk)

        # Берём объект из базовой таблицы Property
        instance = self._get_property_instance(pk)
        property_type = instance.property_type 

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP.get(property_type)
        if not read_serializer_class:
            return Response(
                # я хуй его знает почему тут может быть неизвестный тип, но на всякий случай
                {"error": f"Unknown propertyType {property_type}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = read_serializer_class(instance)

        print("Response data:", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PUT - полное обновление объекта
    def put(self, request, pk):
        print("Incoming data:", request.data)
        
        instance = self._get_property_instance(pk)
        property_type = instance.property_type
        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP[property_type]

        serializer = serializer_class(instance, data=request.data)  # !
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[property_type]
        read_serializer = read_serializer_class(instance)
        
        print("Response data:", read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_200_OK)


    # PATCH - частичное обновление (например, только статус)
    def patch(self, request, pk):
        print("Incoming data:", request.data)
        
        instance = self._get_property_instance(pk)
        property_type = instance.property_type
        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP[property_type]
 
        serializer = serializer_class(instance, data=request.data, partial=True) # !
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[property_type]
        read_serializer = read_serializer_class(instance)
        
        print("Response data:", read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_200_OK)