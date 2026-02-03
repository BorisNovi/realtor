from rest_framework.views import APIView
from catalog.catalog_models import Property
from ..utils.pagination import FrontendPagination
from catalog.utils.filters import apply_catalog_filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
from catalog.serializers.catalog_list_serializer import CatalogListSerializer

# Этот класс отвечает за получение списка объектов недвижимости
# Он использует пагинацию и фильтрацию для формирования ответа
class CatalogListView(APIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        properties = Property.objects.filter(is_deleted=False)

        # Фильтры
        filtered = apply_catalog_filters(properties, request.query_params)

        # Сортировка
        sort_field: str = request.query_params.get("sortField", None)
        sort_order: str = request.query_params.get("sortOrder", "desc")
        reverse = sort_order.lower() == "desc"

        def get_sort_value(obj):
            if sort_field and hasattr(obj, sort_field):
                return getattr(obj, sort_field)
            return getattr(obj, "date_added", None)

        filtered.sort(key=get_sort_value, reverse=reverse)

        # Пагинация
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)
        
        serialized = CatalogListSerializer(paginated_qs, many=True).data
        
        print("Response data:", serialized)
        return paginator.get_paginated_response(serialized)




