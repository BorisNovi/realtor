from rest_framework.views import APIView
from catalog.catalog_models import Flat
from ..utils.pagination import FrontendPagination
from itertools import chain
from catalog.utils.filters import apply_catalog_filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
from catalog.serializers.catalog_list_serializer import CatalogListSerializer

# Карта соответствия типов недвижимости и моделей
PROPERTY_MODEL_MAP = {
    'flat': Flat,
}

# Этот класс отвечает за получение списка объектов недвижимости
# Он использует пагинацию и фильтрацию для формирования ответа
class CatalogListView(APIView):
    # 🔹 Используем JWT для аутентификации
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True) 
        # offices = Office.objects.filter(deleted_at__isnull=True)
        # lands = Land.objects.filter(deleted_at__isnull=True)

        combined = list(chain(flats, 
                            #   offices, lands
                              ))

        # Фильтры
        filtered = apply_catalog_filters(combined, request.query_params)

        # Сортировка
        sort_field: str = request.query_params.get("sortField", None)
        sort_order: str = request.query_params.get("sortOrder", "desc")
        reverse = sort_order.lower() == "desc"

        def get_sort_value(obj):
            # Проверяем наличие атрибута, иначе None
            if sort_field and hasattr(obj, sort_field):
                return getattr(obj, sort_field)
            return getattr(obj, "date_added", None)  # дефолтное поле

        filtered.sort(key=get_sort_value, reverse=reverse)

        # Пагинация
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)
        
        serialized = CatalogListSerializer(paginated_qs, many=True).data
        return paginator.get_paginated_response(serialized)



