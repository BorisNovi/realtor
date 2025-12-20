# catalog_map_view.py
# Ответственный за получение объектов недвижимости в заданных координатах для отображения на карте.
from rest_framework.views import APIView
from rest_framework.response import Response
from catalog.catalog_models import Flat
from catalog.serializers.catalog_list_serializer import CatalogListSerializer
from catalog.utils.filters import apply_catalog_filters
from rest_framework import permissions

# Получение объектов недвижимости в заданных координатах при работе с картой.
class CatalogMapView(APIView):
    """Возвращает объекты в квадрате, заданном координатами."""

    print('Получен запрос на объекты в квадрате по координатам.')

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # параметры фронта в camelCase
        required = ("lngMin", "lngMax", "latMin", "latMax")
        if not all(p in request.query_params for p in required):
            return Response({"detail": "Missing map bounds"}, status=400)

        lng_min = float(request.query_params["lngMin"])
        lng_max = float(request.query_params["lngMax"])
        lat_min = float(request.query_params["latMin"])
        lat_max = float(request.query_params["latMax"])

        # все объекты
        flats = Flat.objects.filter(deleted_at__isnull=True)
        combined = list(flats)  # если будут другие модели, добавим через chain

        # фильтры фронта
        filtered = apply_catalog_filters(combined, request.query_params)

        # фильтр по квадрату
        def in_bounds(obj):
            pos = obj.address.get("position")
            if not pos or len(pos) < 2:
                return False
            lng, lat = map(float, pos)
            return lng_min <= lng <= lng_max and lat_min <= lat <= lat_max

        filtered = list(filter(in_bounds, filtered))

        # сериализуем через существующий CatalogListSerializer
        serialized = CatalogListSerializer(filtered, many=True).data
        return Response(serialized)
