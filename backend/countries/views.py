from typing import Optional
from django.db.models import Q
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework import permissions
from realtor.helpers import build_prefix_tsquery
from catalog.utils.filters import apply_catalog_filters
from catalog.utils.pagination import FrontendPagination
from .models import Country
from .serializers import CountrySerializer


class CountryViewSet(ReadOnlyModelViewSet):
    queryset = Country.objects.filter()
    serializer_class = CountrySerializer
    lookup_field = "code" # На случай прямого запроса страны из адресной строки
    pagination_class = FrontendPagination

    def _build_prefix(self, text: str) -> Optional[SearchQuery]:
        return build_prefix_tsquery(text)

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        qs = apply_catalog_filters(qs, self.request.query_params)
        
        sort_field = self.request.query_params.get("sortField")
        if sort_field == "name":
            sort_field = "name"
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