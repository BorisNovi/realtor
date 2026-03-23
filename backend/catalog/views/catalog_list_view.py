from typing import Optional
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q
from realtor import mixins
from realtor.helpers import build_prefix_tsquery
from catalog.catalog_models import Property
from catalog.utils.filters import apply_catalog_filters
from catalog.serializers.catalog_list_serializer import CatalogListSerializer
from ..utils.pagination import FrontendPagination


# Этот класс отвечает за получение списка объектов недвижимости
# Он использует пагинацию и фильтрацию для формирования ответа
class CatalogListView(mixins.CurrentUserQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = CatalogListSerializer
    pagination_class = FrontendPagination
    authentication_classes = [JWTAuthentication]
    queryset = Property.objects.filter(is_deleted=False) 

    def _build_prefix(self, text: str) -> Optional[SearchQuery]:
        return build_prefix_tsquery(text)

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        qs = apply_catalog_filters(qs, self.request.query_params)
        
        sort_field = self.request.query_params.get("sortField")
        if sort_field == "dateAdded":
            sort_field = "date_added"
        if sort_field:
            direction = "-" if self.request.query_params.get("sortOrder", "desc").lower() == "desc" else ""
            qs = qs.order_by(direction + sort_field)
        
        if search and search.strip():
            tsquery = self._build_prefix(search)
            if tsquery:
                vector = SearchVector("name")
                fts_qs = (
                    qs.annotate(search_vector=vector)
                    .filter(search_vector=tsquery)
                    .annotate(rank=SearchRank(vector, tsquery))
                    .order_by("-rank")
                )
                qs = fts_qs if fts_qs.exists() else qs.filter(Q(name__icontains=search))
            else:
                qs = qs.filter(Q(name__icontains=search))


        return qs





