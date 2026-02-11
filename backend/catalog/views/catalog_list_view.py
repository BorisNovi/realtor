from rest_framework.views import APIView
from catalog.catalog_models import Property
from ..utils.pagination import FrontendPagination
from catalog.utils.filters import apply_catalog_filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from catalog.serializers.catalog_list_serializer import CatalogListSerializer
from rest_framework import viewsets
from realtor import mixins

# Этот класс отвечает за получение списка объектов недвижимости
# Он использует пагинацию и фильтрацию для формирования ответа
class CatalogListView(mixins.CurrentUserQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = CatalogListSerializer
    pagination_class = FrontendPagination
    authentication_classes = [JWTAuthentication]
    queryset = Property.objects.filter(is_deleted=False)  

    def get_queryset(self):
        qs = super().get_queryset()
        qs = apply_catalog_filters(qs, self.request.query_params)
        
        sort_field = self.request.query_params.get("sortField")
        if sort_field:
            direction = "-" if self.request.query_params.get("sortOrder", "desc").lower() == "desc" else ""
            qs = qs.order_by(direction + sort_field)
        
        return qs





