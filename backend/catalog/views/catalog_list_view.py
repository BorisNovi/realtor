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
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True) 
        
        combined = sorted(chain(flats), key=lambda obj: obj.date_added, reverse=True) 

        filtered = apply_catalog_filters(combined, request.query_params)
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)

        serialized = CatalogListSerializer(paginated_qs, many=True).data

        return paginator.get_paginated_response(serialized)

