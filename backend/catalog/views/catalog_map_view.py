# catalog_map_view.py
# Ответственный за получение объектов недвижимости в заданных координатах для отображения на карте.
from rest_framework.views import APIView
from rest_framework.response import Response
from catalog.catalog_models import Flat
from itertools import chain
from catalog.serializers.catalog_map_serializer import CatalogMapSerializer
from catalog.utils.filters import apply_catalog_filters
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Карта соответствия типов недвижимости и моделей
PROPERTY_MODEL_MAP = {
    'flat': Flat,
}

# Получение объектов недвижимости в заданных координатах при работе с картой.
class CatalogMapView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True)
        # offices = Office.objects.filter(deleted_at__isnull=True)
        # lands = Land.objects.filter(deleted_at__isnull=True)

        combined = list(chain(flats,
                              # offices, lands
                              ))

        # Получаем координаты квадрата
        lng_min = request.query_params.get("lngMin") or request.query_params.get("box.minLng")
        lng_max = request.query_params.get("lngMax") or request.query_params.get("box.maxLng")
        lat_min = request.query_params.get("latMin") or request.query_params.get("box.minLat")
        lat_max = request.query_params.get("latMax") or request.query_params.get("box.maxLat")

        if not all([lng_min, lng_max, lat_min, lat_max]):
            return Response({"detail": "Союз развалили, и запрос тоже"}, status=400)

        lng_min, lng_max, lat_min, lat_max = map(float, [lng_min, lng_max, lat_min, lat_max])

        # Применяем обычные фильтры каталога
        filtered = apply_catalog_filters(combined, request.query_params)

        # Фильтруем по координатам
        def in_bounds(obj):
            pos = obj.address.get("position")
            if not pos or len(pos) < 2:
                return False
            lng, lat = map(float, pos)
            return lng_min <= lng <= lng_max and lat_min <= lat <= lat_max

        filtered = list(filter(in_bounds, filtered))

        # Сортировка
        sort_field: str = request.query_params.get("sortField", None)
        sort_order: str = request.query_params.get("sortOrder", "desc")
        reverse = sort_order.lower() == "desc"

        def get_sort_value(obj):
            if sort_field and hasattr(obj, sort_field):
                return getattr(obj, sort_field)
            return getattr(obj, "date_added", None)

        filtered.sort(key=get_sort_value, reverse=reverse)

        serializer = CatalogMapSerializer(filtered, many=True)
        total_count = len(filtered)

        
        return Response({
            "items": serializer.data,
            "total": total_count
        })
