from colorama import init, Fore
from rest_framework import status
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

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
    authentication_classes = [JWTAuthentication]  

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

    def post(self, request):
        print(Fore.BLUE + "=== GOT DATA FOR CREATE: ===" + Fore.RESET)
        print(f"Incoming data: {request.data}")
        
        property_type = request.data.get("propertyType") or request.data.get("property_type")
        if not property_type:
            return Response({"error": "propertyType is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"error": f"Unknown propertyType {property_type}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[property_type]
        read_serializer = read_serializer_class(instance)
        
        print("Response data:", read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, pk):
        print("Requested pk:", pk)

        instance = self._get_property_instance(pk)
        property_type = instance.property_type 

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP.get(property_type)
        if not read_serializer_class:
            return Response(
                {"error": f"UNKNOWN_TYPE {property_type}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = read_serializer_class(
            instance,
            context={'request': request}
        )

        print("Response data:", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Новый апдейт с логикой пересоздания объекта в другой таблице. 
    def update(self, request, pk, partial=False):
        instance = self._get_property_instance(pk)
        current_type = instance.property_type
        incoming_type = request.data.get("property_type", current_type)

        if incoming_type != current_type:
            # Смена типа — пересоздаём объект
            return self._change_property_type(instance, incoming_type, request)

        # Обычный апдейт без смены типа
        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(current_type)
        if not serializer_class:
            return Response({"error": f"Unknown property type: {current_type}"}, status=400)

        serializer = serializer_class(
            instance,
            data=request.data,
            partial=partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[current_type]
        read_serializer = read_serializer_class(instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def _change_property_type(self, old_instance, new_type, request):
        serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(new_type)
        if not serializer_class:
            return Response({"error": f"Unknown property type: {new_type}"}, status=400)

        old_id = old_instance.pk
        old_instance.delete()

        serializer = serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Добавляем id в validated_data до создания объекта
        serializer.validated_data['id'] = old_id
        new_instance = serializer.save()

        read_serializer_class = PROPERTY_READ_SERIALIZER_MAP[new_type]
        read_serializer = read_serializer_class(new_instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        return self.update(request, pk, partial=False)

    def patch(self, request, pk):
        return self.update(request, pk, partial=True)
